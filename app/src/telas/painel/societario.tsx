import { useContext, useMemo, useState } from 'react'
import { ArrowsClockwiseIcon, BuildingsIcon, CertificateIcon, ClockCounterClockwiseIcon, CopyIcon, DeviceMobileIcon, GavelIcon, HandshakeIcon, IdentificationCardIcon, KeyIcon, PackageIcon, PlusIcon, StampIcon, TreeStructureIcon, WarningIcon } from '@phosphor-icons/react'
import { registrarExecutor, useAgenteS02 } from '@/ambiente/agente-s02'
import { useDocumentos } from '@/ambiente/documentos'
import { useFluxos } from '@/ambiente/fluxos'
import { useLoja, useNavegacao } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { AbaCtx } from '@/components/compostos/painel-aba'
import { BotaoAcoes, EstadoVazio, useConfirmar, type AcaoMenu } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, GavetaFormulario } from '@/components/ui/formulario'
import type { DefWidget, TamanhoWidget } from '@/components/widgets/tipos'
import { ddmm, diasEntre, HOJE_DEMO } from '@/dados/obrigacoes-setor'
import { societarioDe } from '@/dados/painel-abas'
import { useColecao } from '@/dados/s02/colecao'
import { resumoEntrega, usePreferenciaEntrega } from '@/dados/s02/ficha'
import { cn } from '@/lib/utils'
import type { Cliente, EstadoCiclo } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { servicos } from '@/servicos'
import { rotuloEstado, useClienteEntidade } from './anatomia'
import { widgetObrigacoesDoSetor } from './obrigacoes-setor'
import {
  acessosSemente,
  appSemente,
  cadastroDomicilio,
  colAcessos,
  colApp,
  colComunicacoes,
  colContratos,
  colCredenciais,
  colProcessos,
  colRepetidos,
  comunicacoesSemente,
  contratosSemente,
  credenciaisSemente,
  licencasSemente,
  processosSemente,
  repetidosSemente,
  type AcessoApp,
  type AcessoOrgao,
  type ComunicacaoOficial,
  type ContratoCliente,
  type Credencial,
  type Licenca,
  type Processo,
  type Repetido,
} from './societario/dados'
import { GavetaAbrirProcesso, GavetaCadastrarCnpj, GavetaCorrigir, GavetaFundir, GavetaMudarEstado, GavetaPedirAcesso, GavetaProcesso, GavetaRegistrarA3, GavetaVersionar, rotuloRegime, useAbrirComunicacao, useGatilhoCertificados } from './societario/gavetas'
import { Dias, IconeSituacao, Linha, Numero, Tabela } from './Tabela'
import type { CtxAba, WidgetsAba } from './tipos'

/**
 * Clientes e Societário (03, 6.1; S02-T02): a base de tudo. Ficha com versões,
 * pessoas, acessos, certificados, contrato, legalização, comunicações oficiais,
 * ciclo de vida, app do cliente, entrega (malote) e arquivos repetidos. Em
 * carteira: certificados a vencer, clientes por estado, acessos pendentes e
 * licenças. O integrante Societário age por gatilho (certificado a 30 dias,
 * divergência com a Receita, mudança de perfil) e prepara o resto em cartão.
 */
export function widgetsSocietario(ctx: CtxAba): WidgetsAba {
  const { cliente } = ctx
  if (!cliente) return { catalogo: [certificadosCarteira, estadosCarteira, acessosCarteira, licencasCarteira, widgetObrigacoesDoSetor('societario', ctx)] }
  return { catalogo: [ficha, pessoas, acessos, certificados, contrato, processos, comunicacoes, ciclo, app, entrega, repetidos, widgetObrigacoesDoSetor('societario', ctx)] }
}

/* ---------- Contexto ---------- */

function useAbaSoc() {
  const ctx = useContext(AbaCtx)
  const cliente = useClienteEntidade(ctx.clienteId)
  const { usuario, permissoes } = useSessao()
  const admin = usuario.papel === 'administrador'
  const gestor = usuario.papel !== 'colaborador'
  const podeSoc = admin || permissoes.setores.includes('societario')
  const leitura = !!ctx.somenteLeitura
  return { ctx, cliente, admin, gestor, podeSoc: podeSoc && !leitura, leitura, usuario }
}

const dias = (iso: string) => diasEntre(HOJE_DEMO, iso)

/* ---------- Ficha e perfil temporal (SOC-001, 002, 003, 034) ---------- */

interface Divergencia {
  id: string
  cliente_id: string
  campo: string
  receita: string
  cadastro: string
}

function Ficha({ t }: { t: TamanhoWidget }) {
  const { cliente, podeSoc, admin } = useAbaSoc()
  const versoes = useTabela('versao_perfil')
  const tela = useTabela('registro_tela')
  const trabalhar = useAgenteS02()
  const [gaveta, setGaveta] = useState<'versionar' | 'receita' | 'corrigir' | 'fundir' | null>(null)
  if (!cliente) return null
  const lista = versoes.filter((v) => v.cliente_id === cliente.id).sort((a, b) => b.vigente_de.localeCompare(a.vigente_de) || b.criado_em.localeCompare(a.criado_em))
  const resolvidas = (tela.find((r) => r.id === 's02:divergencias-resolvidas')?.valor as string[] | undefined) ?? []
  const d0 = societarioDe(cliente.id).divergencia
  const div: Divergencia | undefined = d0 && !resolvidas.includes(`dv-${cliente.id}`) ? { id: `dv-${cliente.id}`, cliente_id: cliente.id, ...d0 } : undefined
  const conferir = () =>
    trabalhar({
      setor: 'societario',
      titulo: 'Conferir o cadastro na Receita',
      cliente: cliente.nome,
      clienteId: cliente.id,
      atividade: 'SOC-003',
      etapas: ['Consultando o CNPJ na Receita', 'Comparando QSA, CNAE, endereço e situação'],
      seg: 0.9,
      texto: div ? `${cliente.nome}: ${div.campo} diferente. Na Receita está “${div.receita}”, aqui “${div.cadastro}”. ${/inapta/i.test(div.receita) ? 'Decisão: regularizar ou falar com o cliente antes?' : 'Posso preparar a versão nova do perfil com os dados da Receita.'}` : `${cliente.nome}: cadastro igual ao da Receita. Nada a fazer.`,
      aviso: div ? `${cliente.nome}: divergência com a Receita (${div.campo})` : undefined,
      cartao: div && /inapta/i.test(div.receita) ? { acao: { tipo: 'societario.regularizar', clienteId: cliente.id, motivo: div.receita }, resumo: 'Abrir a regularização na Receita', argumentos: [['Situação', div.receita]] } : undefined,
    })
  const acoes: AcaoMenu[] = [
    ...(podeSoc ? [{ rotulo: 'Versionar o perfil…', onSelecionar: () => setGaveta('versionar') }, { rotulo: 'Corrigir digitação…', onSelecionar: () => setGaveta('corrigir') }, { rotulo: 'Conferir na Receita agora', onSelecionar: conferir }] : []),
    ...(admin ? [{ rotulo: 'Fundir com outro cadastro…', onSelecionar: () => setGaveta('fundir'), separar: true, perigo: true }] : []),
  ]
  return (
    <div className="flex flex-col gap-3">
      {gaveta === 'versionar' && <GavetaVersionar cliente={cliente} onFechar={() => setGaveta(null)} />}
      {gaveta === 'receita' && div && <GavetaVersionar cliente={cliente} inicial={div.campo.startsWith('CNAE') ? { cnaes: [...(lista[0]?.cnaes ?? []), div.receita] } : undefined} motivoInicial={`Dados da Receita: ${div.campo} ${div.receita} (SOC-003)`} onFechar={() => setGaveta(null)} />}
      {gaveta === 'corrigir' && <GavetaCorrigir cliente={cliente} onFechar={() => setGaveta(null)} />}
      {gaveta === 'fundir' && <GavetaFundir cliente={cliente} onFechar={() => setGaveta(null)} />}
      <div className="flex items-start gap-2">
        {div ? (
          <div className="bg-warning/10 flex min-w-0 flex-1 items-start gap-2 rounded-[14px] px-3 py-2 text-sm">
            <IconeSituacao s="atencao" className="mt-0.5" />
            <span className="min-w-0 flex-1">
              <span className="block">Receita × cadastro: {div.campo}</span>
              <span className="text-muted-foreground block text-xs">
                Receita {div.receita} · aqui {div.cadastro}
              </span>
            </span>
            {t !== 'M' && podeSoc && !/inapta/i.test(div.receita) && (
              <Button size="sm" variant="ghost" className="shrink-0 rounded-full" onClick={() => setGaveta('receita')}>
                Versionar
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-success/10 flex min-w-0 flex-1 items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
            <IconeSituacao s="ok" /> Cadastro igual ao da Receita (conferido hoje às 06:10)
          </div>
        )}
        {acoes.length > 0 && <BotaoAcoes acoes={acoes} rotulo="Ações da ficha" />}
      </div>
      {t !== 'M' && (
        <ol className="border-border relative flex flex-col gap-2.5 border-l pl-4">
          {lista.slice(0, 4).map((v) => (
            <li key={v.id} className="relative">
              <span className={cn('absolute top-1.5 -left-[21px] size-2.5 rounded-full', !v.vigente_ate ? 'bg-foreground' : 'bg-sunken ring-border ring-1')} />
              <span className="block text-sm">
                {v.motivo_versao} {!v.vigente_ate && <Badge variant="outline">vigente</Badge>}
              </span>
              <span className="text-muted-foreground block text-xs">
                desde {ddmm(v.vigente_de)}/{v.vigente_de.slice(0, 4)} · {rotuloRegime[v.regime]} · {v.uf}
                {v.extras?.corrigido_por ? ` · corrigido por ${String(v.extras.corrigido_por)}` : ''}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

registrarExecutor('societario.regularizar', (acao, { loja, quem }) => {
  colProcessos.criar({ cliente_id: String(acao.clienteId), orgao: 'Receita Federal', tipo: 'regularização', titulo: `Regularizar: ${String(acao.motivo)}`, uf: 'SP', etapa: 'aberto pelo cartão', situacao: 'andamento', checklist: [{ item: 'Levantar a omissão que causou a situação', feito: false }, { item: 'Entregar a declaração omissa', feito: false }, { item: 'Pedir a reativação do CNPJ', feito: false }, { item: 'Conferir a situação na Receita', feito: false }], andamentos: [{ quando: new Date().toISOString(), texto: `Aberto por ${quem} a partir do aviso do Societário`, por: quem }] }, { texto: `${quem} aprovou abrir a regularização (${String(acao.motivo)})` })
  loja.toast('Processo de regularização aberto no Societário, com o checklist.')
})

const ficha: DefWidget = {
  id: 'ficha',
  titulo: 'Ficha e perfil temporal',
  atividades: 'SOC-001, 002, 003, 034',
  descricao: 'Versão vigente, linha de versões e divergência com a Receita',
  icone: ClockCounterClockwiseIcon,
  tamanhos: ['M', 'G'],
  conteudo: (t) => <Ficha t={t} />,
}

/* ---------- Pessoas e identidades (SOC-004, GES-041) ---------- */

function PessoasDoCliente({ t }: { t: TamanhoWidget }) {
  const { cliente, podeSoc } = useAbaSoc()
  const loja = useLoja()
  const fluxos = useFluxos()
  const appAcessos = useColecao<AcessoApp>('app-acessos', appSemente, (a) => a.cliente_id === cliente?.id)
  if (!cliente) return null
  const contatos = loja.fichaDe(cliente.id)?.contatos ?? []
  if (!contatos.length) return <EstadoVazio compacto titulo="Sem pessoas cadastradas" descricao="Adicione os sócios e contatos na ficha do cliente." acao={podeSoc ? <Button size="sm" variant="outline" className="rounded-full" onClick={() => fluxos.fichaCliente(cliente.id)}>Abrir a ficha</Button> : undefined} />
  return (
    <div className="flex flex-col gap-2">
      <ul className={cn('divide-border/70 grid divide-y', t === 'XL' && 'grid-cols-2 gap-x-6 divide-y-0')}>
        {contatos.map((p) => {
          const app = appAcessos.find((a) => a.pessoa === p.nome)
          return (
            <Linha
              key={p.nome}
              className="py-2 first:pt-0"
              inicio={
                <span className="bg-sunken text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {p.nome
                    .replace('Dra. ', '')
                    .split(' ')
                    .slice(0, 2)
                    .map((x) => x[0])
                    .join('')}
                </span>
              }
              titulo={p.nome}
              detalhe={`${p.papel} · recebe ${p.assuntos.join(', ').replace('documentos_pendentes', 'documentos').replace('honorarios', 'honorários').replace('societario', 'societário') || 'nada'}`}
              fim={
                <span className="flex flex-col items-end gap-0.5 text-[11px]">
                  <span>{app?.situacao === 'ativo' ? 'usa o app' : app?.situacao === 'convite_pendente' ? 'convite pendente' : app?.situacao === 'revogado' ? 'acesso revogado' : 'sem app'}</span>
                  {!p.whatsapp && <span className="text-muted-foreground">sem WhatsApp</span>}
                </span>
              }
            />
          )
        })}
      </ul>
      {podeSoc && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => fluxos.fichaCliente(cliente.id)}>
          <PlusIcon /> Adicionar ou editar na ficha
        </Button>
      )}
    </div>
  )
}

const pessoas: DefWidget = {
  id: 'pessoas',
  titulo: 'Pessoas e identidades',
  atividades: 'SOC-004, GES-041',
  descricao: 'Sócios, contatos por assunto, papel no app e opt-in',
  icone: IdentificationCardIcon,
  tamanhos: ['G', 'XL'],
  conteudo: (t) => <PessoasDoCliente t={t} />,
}

/* ---------- Acessos e procurações (SOC-011 a 014, PF-002, FIS-007) ---------- */

const situacaoAcesso: Record<AcessoOrgao['situacao'], 'ok' | 'atencao' | 'erro' | 'neutro'> = { confirmada: 'ok', pedida: 'atencao', pendente: 'atencao', vencida: 'erro' }

function Acessos({ t }: { t: TamanhoWidget }) {
  const { cliente, podeSoc } = useAbaSoc()
  const lista = useColecao<AcessoOrgao>('acessos', acessosSemente, (a) => a.cliente_id === cliente?.id)
  const trabalhar = useAgenteS02()
  const [gaveta, setGaveta] = useState<'pedir' | 'fora' | null>(null)
  if (!cliente) return null
  const confirmar = () =>
    trabalhar({
      setor: 'societario',
      titulo: 'Confirmar procurações no portal',
      cliente: cliente.nome,
      clienteId: cliente.id,
      atividade: 'SOC-012',
      etapas: ['Consultando o Integra-Procurações', 'Atualizando validade e serviços cobertos'],
      seg: 0.9,
      texto: 'Conferi as procurações na Receita e atualizei as que apareceram.',
      aoTerminar: async () => {
        try {
          const r = await servicos.cadastros.procuracoes(cliente.documento)
          const ativa = r.dados.find((p) => p.situacao === 'ativa')
          colAcessos.listar().filter((a) => a.cliente_id === cliente.id && a.orgao === 'e-CAC').forEach((a) => colAcessos.atualizar(a.id, { situacao: 'confirmada', validade: ativa?.validade ?? a.validade }, { texto: `Societário confirmou a procuração e-CAC de ${cliente.nome} no portal (SOC-012)` }))
        } catch {
          /* falha simulada: fica como estava; o integrante tenta no próximo ciclo */
        }
      },
    })
  const gavetas = (
    <>
      {gaveta === 'pedir' && <GavetaPedirAcesso cliente={cliente} onFechar={() => setGaveta(null)} />}
      {gaveta === 'fora' && <GavetaPedirAcesso cliente={cliente} registrarFora onFechar={() => setGaveta(null)} />}
    </>
  )
  const botoes = podeSoc && (
    <div className="flex flex-wrap gap-1">
      <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => setGaveta('pedir')}>
        Pedir ao cliente
      </Button>
      <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={confirmar}>
        <ArrowsClockwiseIcon /> Confirmar no portal
      </Button>
      <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => setGaveta('fora')}>
        Registrar fora da RFB
      </Button>
    </div>
  )
  if (t === 'M')
    return (
      <div className="flex h-full items-end justify-between gap-3">
        {gavetas}
        <Numero valor={`${lista.filter((a) => a.situacao === 'confirmada').length}/${lista.length}`} legenda="acessos em dia" />
        <span className="text-muted-foreground pb-0.5 text-right text-xs">
          {lista.some((a) => a.situacao !== 'confirmada')
            ? `falta: ${lista
                .filter((a) => a.situacao !== 'confirmada')
                .map((a) => a.orgao)
                .join(', ')}`
            : 'tudo confirmado'}
        </span>
      </div>
    )
  return (
    <div className="flex h-full flex-col gap-2">
      {gavetas}
      <Tabela colunas={[{ rotulo: '' }, { rotulo: 'Órgão' }, { rotulo: 'Serviço' }, { rotulo: 'Validade' }, { rotulo: 'Situação' }]} minimo={480}>
        {lista.map((a) => (
          <tr key={a.id}>
            <td className="w-6 py-1.5">
              <IconeSituacao s={situacaoAcesso[a.situacao]} />
            </td>
            <td className="py-1.5 pr-2">{a.orgao}</td>
            <td className="text-muted-foreground py-1.5 pr-2">{a.servico}</td>
            <td className="py-1.5 pr-2 tabular-nums">{a.validade}</td>
            <td className="py-1.5 text-xs">{a.situacao === 'pedida' ? `pedida · ${a.cobrancas ?? 0} cobranças` : a.situacao}</td>
          </tr>
        ))}
      </Tabela>
      {botoes}
    </div>
  )
}

const acessos: DefWidget = {
  id: 'acessos',
  titulo: 'Acessos e procurações',
  atividades: 'SOC-011 a 014, PF-002',
  descricao: 'Órgão, serviço, validade e situação (confirmada, pedida, vencida)',
  icone: KeyIcon,
  tamanhos: ['M', 'XL'],
  conteudo: (t) => <Acessos t={t} />,
}

/* ---------- Certificados (SOC-008 a 010, GES-058; C2-23) ---------- */

function Certificados({ t }: { t: TamanhoWidget }) {
  const { cliente, podeSoc } = useAbaSoc()
  const lista = useColecao<Credencial>('credenciais', credenciaisSemente, (c) => c.cliente_id === cliente?.id)
  const trabalhar = useAgenteS02()
  const [a3, setA3] = useState(false)
  const [trilha, setTrilha] = useState<Credencial | null>(null)
  useGatilhoCertificados(cliente?.id)
  if (!cliente) return null
  const pedirA1 = (c?: Credencial) =>
    trabalhar({
      setor: 'gestao_atendimento',
      titulo: 'Pedir o certificado A1 pelo app',
      cliente: cliente.nome,
      clienteId: cliente.id,
      atividade: 'SOC-009',
      etapas: ['Explicando por que o certificado é preciso, em linguagem simples', 'Anexando o termo de uso', 'Publicando a pendência no app (o arquivo vai direto ao cofre)'],
      seg: 0.8,
      texto: `Pedi o A1 de ${cliente.nome} pelo app. Quando o cliente subir, o arquivo vai direto ao cofre e a validade aparece aqui; a senha nunca passa pela conversa.`,
      aoTerminar: () => {
        if (c) colCredenciais.atualizar(c.id, { situacao: 'pedido_ao_cliente' }, { texto: `Atendimento pediu o A1 de ${cliente.nome} pelo app` })
        // O cliente responde pelo app logo depois (demonstração): renovado, com trilha.
        setTimeout(() => {
          const alvo = c ? colCredenciais.obter(c.id) : undefined
          const nova = `${Number(HOJE_DEMO.slice(0, 4)) + 1}${HOJE_DEMO.slice(4)}`
          if (alvo) colCredenciais.atualizar(alvo.id, { situacao: 'valido', validade: nova, trilha: [{ quando: new Date().toISOString(), quem: `${cliente.nome} (app)`, uso: 'enviou o certificado novo ao cofre' }, ...alvo.trilha] }, { texto: `${cliente.nome} enviou o A1 pelo app; validade até ${ddmm(nova)}/${nova.slice(0, 4)}` })
          else colCredenciais.criar({ cliente_id: cliente.id, tipo: 'e-CNPJ A1', titular: cliente.nome, validade: nova, servicos: ['e-CAC', 'NF-e'], situacao: 'valido', trilha: [{ quando: new Date().toISOString(), quem: `${cliente.nome} (app)`, uso: 'enviou o certificado ao cofre' }] }, { texto: `${cliente.nome} enviou o A1 pelo app` })
        }, 6000)
      },
    })
  const principal = [...lista].sort((a, b) => a.validade.localeCompare(b.validade))[0]
  const gavetas = (
    <>
      {a3 && <GavetaRegistrarA3 cliente={cliente} onFechar={() => setA3(false)} />}
      {trilha && (
        <GavetaFormulario aberta onFechar={() => setTrilha(null)} titulo={`Trilha de uso · ${trilha.tipo}`} descricao="Quem usou o certificado, para quê e quando. O arquivo e a senha nunca aparecem." acao="Fechar" onAcao={() => setTrilha(null)}>
          <ol className="flex flex-col gap-1.5 text-sm">
            {trilha.trilha.map((x, i) => (
              <li key={i} className="bg-sunken rounded-[12px] px-3 py-2">
                <span className="text-muted-foreground block text-xs">
                  {new Date(x.quando).toLocaleString('pt-BR')} · {x.quem}
                </span>
                {x.uso}
              </li>
            ))}
          </ol>
        </GavetaFormulario>
      )}
    </>
  )
  if (t === 'P') return principal ? <Numero valor={dias(principal.validade)} legenda={`dias · ${principal.tipo}`} alerta={dias(principal.validade) <= 30} /> : <Numero valor="—" legenda="sem certificado" />
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {gavetas}
      {lista.length === 0 && <li className="text-muted-foreground py-2 text-sm">Sem certificado digital cadastrado.</li>}
      {lista.map((c) => (
        <li key={c.id} className="flex items-center gap-2 py-2 first:pt-0">
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">
              {c.tipo} · {c.titular}
            </span>
            <span className="text-muted-foreground block truncate text-xs">
              {c.situacao === 'pedido_ao_cliente' ? 'renovação pedida pelo app · ' : ''}
              {c.servicos.join(', ')}
              {c.sem_arquivo ? ' · sem arquivo (A3)' : ''}
            </span>
          </span>
          <Dias dias={dias(c.validade)} />
          <BotaoAcoes
            rotulo={`Ações de ${c.tipo}`}
            acoes={[{ rotulo: 'Ver trilha de uso', onSelecionar: () => setTrilha(c) }, ...(podeSoc && !c.sem_arquivo ? [{ rotulo: 'Pedir renovação pelo app', onSelecionar: () => pedirA1(c) }] : [])]}
          />
        </li>
      ))}
      {t === 'G' && podeSoc && (
        <li className="flex flex-wrap gap-1 pt-2">
          <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => pedirA1(lista.find((c) => !c.sem_arquivo))}>
            <ArrowsClockwiseIcon /> Pedir A1 pelo app
          </Button>
          <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => setA3(true)}>
            Registrar A3
          </Button>
        </li>
      )}
    </ul>
  )
}

const certificados: DefWidget = {
  id: 'certificados',
  titulo: 'Certificados',
  atividades: 'SOC-008, 009, 010',
  descricao: 'Tipo, validade, serviços e trilha de uso; o arquivo nunca aparece',
  icone: CertificateIcon,
  tamanhos: ['P', 'M', 'G'],
  conteudo: (t) => <Certificados t={t} />,
}

/* ---------- Contrato e honorários (SOC-015, 016, 019, 020, 101, FIN-001) ---------- */

function Contrato({ t }: { t: TamanhoWidget }) {
  const { cliente, podeSoc } = useAbaSoc()
  const lista = useColecao<ContratoCliente>('contratos', contratosSemente, (c) => c.cliente_id === cliente?.id)
  const trabalhar = useAgenteS02()
  if (!cliente) return null
  const d = societarioDe(cliente.id).contrato
  const c = lista[0] ?? { id: `ct-${cliente.id}`, cliente_id: cliente.id, proposta: '—', contrato: 'sem contrato', lgpd: 'pendente', pld: 'pendente' }
  const gerar = () =>
    trabalhar({
      setor: 'societario',
      titulo: 'Gerar proposta e contrato',
      cliente: cliente.nome,
      clienteId: cliente.id,
      atividade: 'SOC-015',
      etapas: ['Lendo o perfil e os serviços contratados', 'Preenchendo o modelo do escritório (cláusulas mínimas, LGPD, PLD)', 'Gerando o rascunho com o tema'],
      seg: 0.9,
      texto: `Preparei o rascunho de proposta e contrato de ${cliente.nome} no modelo do escritório. Revise e edite antes de mandar para assinatura.`,
      cartoes: [{ tipo: 'documento', id: `doc-ct-${Date.now()}`, nome: `Contrato de prestação de serviços · ${cliente.nome}.pdf`, especie: 'documento', cliente: cliente.nome, competencia: '11/2026' }],
      aoTerminar: () => {
        if (lista[0]) colContratos.atualizar(c.id, { proposta: 'rascunho', contrato: 'rascunho' }, { texto: `Societário preparou o rascunho do contrato de ${cliente.nome}` })
        else colContratos.criar({ ...c, proposta: 'rascunho', contrato: 'rascunho' }, { texto: `Societário preparou o rascunho do contrato de ${cliente.nome}` })
      },
    })
  const enviar = () =>
    trabalhar({
      setor: 'societario',
      titulo: 'Enviar o contrato para assinatura',
      cliente: cliente.nome,
      clienteId: cliente.id,
      atividade: 'SOC-016',
      etapas: ['Escolhendo os signatários (sócios e o escritório)', 'Montando o envelope'],
      seg: 0.8,
      texto: `Envelope pronto para ${cliente.nome}. Aprove para eu mandar pelo provedor de assinatura; volta assinado ao índice.`,
      cartao: { acao: { tipo: 'contrato.enviar_assinatura', clienteId: cliente.id, contratoId: c.id, cliente: cliente.nome }, resumo: 'Enviar o contrato para assinatura', argumentos: [['Documento', `Contrato · ${cliente.nome}`]] },
    })
  const linhas: [string, string, boolean][] = [
    ['Proposta', c.proposta, c.proposta === 'aceita'],
    ['Contrato', c.contrato, c.contrato === 'assinado'],
    ['Termo LGPD', c.lgpd, c.lgpd === 'assinado'],
    ['PLD (cadastro e risco)', c.pld, c.pld === 'feito'],
  ]
  return (
    <div className={cn('flex h-full flex-col gap-3', t === 'M' && 'justify-end')}>
      <div>
        <span className="font-heading text-2xl font-light tabular-nums">{d.honorario}</span>
        <span className="text-muted-foreground block text-xs">
          vence {d.vencimento} · reajuste {d.reajuste} · resumo do Financeiro
        </span>
      </div>
      {t === 'G' && (
        <>
          <ul className="flex flex-col gap-1 text-sm">
            {linhas.map(([r, v, ok]) => (
              <li key={r} className="flex items-center gap-2">
                <IconeSituacao s={ok ? 'ok' : 'atencao'} />
                <span className="flex-1">{r}</span>
                <span className="text-muted-foreground text-xs">{v}</span>
              </li>
            ))}
          </ul>
          {podeSoc && (
            <div className="flex flex-wrap gap-1">
              <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={gerar}>
                Gerar proposta e contrato <span className="text-muted-foreground text-[11px]">preparar</span>
              </Button>
              {c.contrato === 'rascunho' && (
                <Button size="sm" variant="secondary" className="h-7 rounded-full" onClick={enviar}>
                  Enviar para assinatura <span className="text-muted-foreground text-[11px]">com aprovação</span>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

registrarExecutor('contrato.enviar_assinatura', (acao, { loja, quem }) => {
  const id = String(acao.contratoId)
  const nome = String(acao.cliente)
  colContratos.atualizar(id, { contrato: 'enviado para assinatura' }, { texto: `${quem} aprovou o envio do contrato de ${nome} para assinatura` })
  loja.toast(`Contrato de ${nome} enviado para assinatura. Aviso quando voltar assinado.`)
  void servicos.assinatura
    .enviar({ documento: `Contrato · ${nome}`, signatarios: [{ nome, email: 'socio@exemplo.com.br' }] })
    .then((r) => {
      colContratos.atualizar(id, { envelope: r.dados.envelope }, undefined)
      servicos.assinatura.acompanhar(r.dados.envelope, (s) => {
        if (s !== 'concluido') return
        colContratos.atualizar(id, { contrato: 'assinado', proposta: 'aceita', lgpd: 'assinado' }, { texto: `Contrato de ${nome} voltou assinado (envelope ${r.dados.envelope})` })
        loja.adicionarDocumento({ nome: `Contrato assinado · ${nome}.pdf`, clienteId: String(acao.clienteId), pasta: ['permanentes', 'contrato social e alterações'], tipo: 'contrato', origem: 'gerado_plataforma', conector: 'a1', tamanho: '412 KB', quando: 'agora', por: 'Assinatura eletrônica' })
        loja.avisar({ para: [], tipo: 'cliente', setor: 'societario', titulo: `Contrato de ${nome} assinado`, detalhe: 'voltou ao índice de documentos', destino: { modulo: 'painel', aba: 'societario', cliente: String(acao.clienteId) } })
      })
    })
    .catch(() => loja.toastErro('O provedor de assinatura não respondeu (falha simulada). O cartão fica aprovado; o integrante tenta de novo.'))
})

const contrato: DefWidget = {
  id: 'contrato',
  titulo: 'Contrato e honorários',
  atividades: 'SOC-015, 016, 019, 020',
  descricao: 'Proposta, contrato, termo LGPD, PLD e honorário',
  icone: HandshakeIcon,
  tamanhos: ['M', 'G'],
  conteudo: (t) => <Contrato t={t} />,
}

/* ---------- Legalização e processos (SOC-025 a 043; C2-20 a C2-22) ---------- */

function Processos({ t }: { t: TamanhoWidget }) {
  const { cliente, podeSoc } = useAbaSoc()
  const lista = useColecao<Processo>('processos', processosSemente, (p) => p.cliente_id === cliente?.id)
  const licencas = useColecao<Licenca>('licencas', licencasSemente, (l) => l.cliente_id === cliente?.id)
  const [abrir, setAbrir] = useState(false)
  const [aberto, setAberto] = useState<Processo | null>(null)
  if (!cliente) return null
  return (
    <div className="flex flex-col gap-2">
      {abrir && <GavetaAbrirProcesso cliente={cliente} onFechar={() => setAbrir(false)} />}
      {aberto && <GavetaProcesso processo={aberto} cliente={cliente} onFechar={() => setAberto(null)} />}
      <ul className="flex flex-col gap-2">
        {lista.length === 0 && <li className="text-muted-foreground py-2 text-sm">Nenhum processo aberto em órgão.</li>}
        {lista.map((p) => {
          const feitos = p.checklist.filter((c) => c.feito).length
          return (
            <li key={p.id}>
              <button type="button" onClick={() => setAberto(p)} className={cn('flex w-full cursor-pointer items-start gap-3 rounded-[14px] px-3 py-2 text-left', p.situacao === 'exigencia' ? 'bg-warning/10' : 'bg-raised hover:bg-sunken')}>
                <IconeSituacao s={p.situacao === 'concluido' ? 'ok' : p.situacao === 'exigencia' ? 'atencao' : 'neutro'} className="mt-0.5" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">{p.titulo}</span>
                  <span className="text-muted-foreground block text-xs">
                    {p.orgao} · {p.etapa}
                    {p.prazo ? ` · ${p.prazo}` : ''} · {feitos}/{p.checklist.length} passos
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {t === 'XL' && licencas.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-muted-foreground text-xs">Licenças e renovações</p>
          {licencas.map((l) => (
            <div key={l.id} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate">
                {l.nome} <span className="text-muted-foreground">· {l.orgao}</span>
              </span>
              <Dias dias={dias(l.validade)} />
            </div>
          ))}
        </div>
      )}
      {podeSoc && (
        <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setAbrir(true)}>
          <PlusIcon /> Abrir processo
        </Button>
      )}
    </div>
  )
}

const processos: DefWidget = {
  id: 'processos',
  titulo: 'Legalização e processos',
  atividades: 'SOC-025 a 043; C2-20 a 22',
  descricao: 'Processos por órgão com checklist, exigências, licenças e renovações',
  icone: StampIcon,
  tamanhos: ['G', 'XL'],
  conteudo: (t) => <Processos t={t} />,
}

/* ---------- Comunicações oficiais: Domicílio Judicial (SOC-007, 046) ---------- */

function Comunicacoes() {
  const { cliente, podeSoc } = useAbaSoc()
  const lista = useColecao<ComunicacaoOficial>('comunicacoes', comunicacoesSemente, (c) => c.cliente_id === cliente?.id)
  const abrir = useAbrirComunicacao()
  const { usuario } = useSessao()
  if (!cliente) return null
  const cad = cadastroDomicilio[cliente.id] ?? { cadastrado: false, ultima_leitura: '—' }
  return (
    <div className="flex flex-col gap-2">
      <p className="text-muted-foreground text-xs">{cad.cadastrado ? `Cadastrado no Domicílio Judicial · última leitura ${cad.ultima_leitura} (sem dar ciência)` : 'Ainda sem cadastro no Domicílio Judicial: o Societário pede ao cliente (SOC-007).'}</p>
      {lista.length === 0 ? (
        <p className="text-sm">Nenhuma comunicação nova.</p>
      ) : (
        <ul className="divide-border/70 flex flex-col divide-y">
          {lista.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 py-2 first:pt-0">
              <span className="min-w-0 flex-1">
                <span className="block text-sm">
                  {c.tipo} · {c.tribunal}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {c.processo} · {c.aberta_em ? `ciência em ${new Date(c.aberta_em).toLocaleDateString('pt-BR')} por ${c.aberta_por}` : `ciência tácita em ${ddmm(c.prazo_ciencia)} (${dias(c.prazo_ciencia)} dias)`}
                </span>
              </span>
              {!c.aberta_em && podeSoc && (
                <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => abrir(c, () => colComunicacoes.atualizar(c.id, { aberta_em: new Date().toISOString(), aberta_por: usuario.nome }))}>
                  <WarningIcon className="text-warning" /> Abrir (dá ciência)
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const comunicacoes: DefWidget = {
  id: 'comunicacoes',
  titulo: 'Comunicações oficiais',
  atividades: 'SOC-007, 046',
  descricao: 'Domicílio Judicial: cadastro, última leitura e citações, sem dar ciência',
  icone: GavelIcon,
  tamanhos: ['M', 'G'],
  conteudo: () => <Comunicacoes />,
}

/* ---------- Ciclo de vida (CIC-001 a 010) ---------- */

const trilhaVisivel: EstadoCiclo[] = ['prospect', 'proposta', 'aceito', 'em_implantacao', 'ativo', 'em_saida', 'em_baixa', 'encerrado']

function Ciclo({ t }: { t: TamanhoWidget }) {
  const { cliente, gestor, leitura } = useAbaSoc()
  const nav = useNavegacao()
  const eventos = useTabela('evento')
  const [mudar, setMudar] = useState(false)
  if (!cliente) return null
  const atual = trilhaVisivel.indexOf(cliente.estado_ciclo === 'inativo' ? 'ativo' : cliente.estado_ciclo)
  const marcos = eventos.filter((e) => e.cliente_id === cliente.id && e.ferramenta === 'cliente.mudar_estado').slice(-3)
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      {mudar && <GavetaMudarEstado cliente={cliente} onFechar={() => setMudar(false)} />}
      <ol className="flex items-center gap-1">
        {trilhaVisivel.map((e, i) => (
          <li key={e} className="flex min-w-0 flex-1 flex-col gap-1">
            <span className={cn('h-1.5 rounded-full', i < atual ? 'bg-success' : i === atual ? 'bg-foreground' : 'bg-sunken')} />
            {t === 'XL' && <span className={cn('truncate text-[11px]', i === atual ? 'font-medium' : 'text-muted-foreground')}>{rotuloEstado[e]}</span>}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm">
          Estado: <strong className="font-medium">{rotuloEstado[cliente.estado_ciclo]}</strong> <span className="text-muted-foreground text-xs">desde {ddmm(cliente.estado_ciclo_desde)}</span>
        </span>
        {t !== 'M' && marcos.length > 0 && <span className="text-muted-foreground truncate text-xs">· {marcos.map((m) => m.texto).join(' · ')}</span>}
        <span className="ml-auto flex gap-1">
          {(cliente.estado_ciclo === 'em_implantacao' || cliente.estado_ciclo === 'em_saida') && (
            <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => nav.irPara({ modulo: 'painel', aba: 'societario', trilha: cliente.id })}>
              <TreeStructureIcon /> ver trilha
            </Button>
          )}
          {gestor && !leitura && (
            <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => setMudar(true)}>
              Mudar estado
            </Button>
          )}
        </span>
      </div>
    </div>
  )
}

const ciclo: DefWidget = {
  id: 'ciclo',
  titulo: 'Ciclo de vida',
  atividades: 'CIC-001 a 010',
  descricao: 'Estado do cliente, marcos e a trilha; mudar estado é do Gestor',
  icone: BuildingsIcon,
  tamanhos: ['M', 'L', 'XL'],
  conteudo: (t) => <Ciclo t={t} />,
}

/* ---------- App do cliente (GES-041, 104; 03, ad. 16) ---------- */

function AppDoCliente({ t }: { t: TamanhoWidget }) {
  const { cliente, podeSoc, gestor } = useAbaSoc()
  const loja = useLoja()
  const fluxos = useFluxos()
  const confirmar = useConfirmar()
  const { usuario } = useSessao()
  const lista = useColecao<AcessoApp>('app-acessos', appSemente, (a) => a.cliente_id === cliente?.id)
  const [convidar, setConvidar] = useState(false)
  if (!cliente) return null
  const contatos = loja.fichaDe(cliente.id)?.contatos ?? []
  const semConvite = contatos.filter((c) => !lista.some((a) => a.pessoa === c.nome && a.situacao !== 'revogado'))
  const revogar = async (a: AcessoApp) => {
    const ok = await confirmar({ titulo: `Revogar o acesso de ${a.pessoa}?`, descricao: 'A sessão no app cai na hora. Mensagens, documentos e registros de entrega continuam guardados.', acao: 'Revogar acesso', perigo: true })
    if (!ok) return
    const antes = colApp.atualizar(a.id, { situacao: 'revogado', revogado_por: usuario.nome }, { texto: `${usuario.nome} revogou o acesso de ${a.pessoa} ao app (${cliente.nome})` })
    loja.toastDesfazer(`Acesso de ${a.pessoa} revogado. A sessão caiu.`, () => antes && colApp.reverter(antes))
  }
  const reenviar = (a: AcessoApp) => {
    colApp.atualizar(a.id, { convidado_em: HOJE_DEMO }, { texto: `${usuario.nome} reenviou o convite do app a ${a.pessoa}` })
    loja.toast(`Convite reenviado a ${a.pessoa} (WhatsApp e e-mail).`)
  }
  const servicosExtras = Object.values(loja.fichaDe(cliente.id)?.servicos ?? {}).filter((s) => s === 'ativo').length
  return (
    <div className="flex h-full flex-col gap-2">
      {convidar && <GavetaConvidar cliente={cliente} contatos={semConvite.map((c) => c.nome)} onFechar={() => setConvidar(false)} />}
      <ul className="divide-border/70 flex flex-col divide-y">
        {lista.slice(0, t === 'G' ? 4 : 8).map((a) => (
          <li key={a.id} className="flex items-center gap-2 py-1.5 first:pt-0">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm">{a.pessoa}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {[a.papeis.contabil && `Contábil: ${a.papeis.contabil}`, a.papeis.bpo_financeiro && `BPO: ${a.papeis.bpo_financeiro}`].filter(Boolean).join(' · ')}
              </span>
            </span>
            <span className="text-muted-foreground shrink-0 text-right text-[11px]">{a.situacao === 'ativo' ? `${a.instalado ? 'instalado · ' : ''}${a.ultimo_acesso ?? ''}` : a.situacao === 'convite_pendente' ? `convite de ${ddmm(a.convidado_em)}` : `revogado por ${a.revogado_por}`}</span>
            {podeSoc && a.situacao !== 'revogado' && (
              <BotaoAcoes
                rotulo={`Ações de ${a.pessoa}`}
                acoes={[...(a.situacao === 'convite_pendente' ? [{ rotulo: 'Reenviar convite', onSelecionar: () => reenviar(a) }] : []), ...(gestor ? [{ rotulo: 'Revogar acesso', perigo: true, onSelecionar: () => void revogar(a) }] : [])]}
              />
            )}
          </li>
        ))}
        {!lista.length && <li className="text-muted-foreground py-2 text-sm">Ninguém da empresa usa o app ainda.</li>}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-1">
        {podeSoc && semConvite.length > 0 && (
          <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => setConvidar(true)}>
            Convidar para o app
          </Button>
        )}
        {gestor && (
          <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => fluxos.fichaCliente(cliente.id)}>
            Serviços extras ({servicosExtras} ativos)
          </Button>
        )}
      </div>
    </div>
  )
}

function GavetaConvidar({ cliente, contatos, onFechar }: { cliente: Cliente; contatos: string[]; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const bpo = cliente.servicos_contratados.includes('bpo')
  const [pessoa, setPessoa] = useState(contatos[0] ?? '')
  const [contabil, setContabil] = useState('financeiro (guias)')
  const [bpoPapel, setBpoPapel] = useState('envia documentos')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Convidar para o app do cliente"
      descricao="Convite por WhatsApp e e-mail, com o papel em cada serviço contratado (06, 2.1). Fica em “convites pendentes” até a pessoa entrar."
      acao="Convidar"
      acaoDesabilitada={!pessoa}
      onAcao={() => {
        colApp.criar({ cliente_id: cliente.id, pessoa, papeis: { contabil, ...(bpo ? { bpo_financeiro: bpoPapel } : {}) }, situacao: 'convite_pendente', convidado_em: HOJE_DEMO }, { texto: `${usuario.nome} convidou ${pessoa} para o app (${cliente.nome})` })
        loja.toast(`Convite enviado a ${pessoa}.`)
        onFechar()
      }}
    >
      <Campo rotulo="Pessoa">{(id) => <CampoEscolha id={id} valor={pessoa} onMudar={setPessoa} opcoes={contatos.map((c) => ({ valor: c, rotulo: c }))} />}</Campo>
      <Campo rotulo="Papel no Contábil">{(id) => <CampoEscolha id={id} valor={contabil} onMudar={setContabil} opcoes={['sócio (vê tudo)', 'financeiro (guias)', 'RH (holerites e folha)', 'contador interno', 'leitura'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
      {bpo && <Campo rotulo="Papel no BPO financeiro">{(id) => <CampoEscolha id={id} valor={bpoPapel} onMudar={setBpoPapel} opcoes={['aprovador de pagamentos', 'envia documentos', 'leitura'].map((x) => ({ valor: x, rotulo: x }))} />}</Campo>}
    </GavetaFormulario>
  )
}

const app: DefWidget = {
  id: 'app',
  titulo: 'App do cliente',
  atividades: 'GES-041, 104',
  descricao: 'Pessoas e papéis por serviço, convites, revogar acesso, serviços extras',
  icone: DeviceMobileIcon,
  tamanhos: ['G', 'XL'],
  conteudo: (t) => <AppDoCliente t={t} />,
}

/* ---------- Preferência de entrega e malote (C2-09) ---------- */

function Entrega() {
  const { cliente, podeSoc } = useAbaSoc()
  const pref = usePreferenciaEntrega(cliente?.id)
  const fluxos = useFluxos()
  const loja = useLoja()
  const { usuario } = useSessao()
  if (!cliente || !pref) return null
  const malote = pref.modo === 'malote' || pref.modo === 'motoboy'
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <p className="text-sm">{resumoEntrega(pref)}</p>
      {malote && <p className="text-muted-foreground text-xs">Tarefas de entrega física nascem com o checklist de protocolo de devolução.</p>}
      <div className="flex flex-wrap gap-1">
        {podeSoc && (
          <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => fluxos.fichaCliente(cliente.id)}>
            Mudar na ficha
          </Button>
        )}
        {malote && podeSoc && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 rounded-full"
            onClick={() => {
              loja.adicionarDocumento({ nome: `Malote recebido ${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`, clienteId: cliente.id, pasta: ['2026', '2026-11', 'malote'], tipo: 'outro', origem: 'upload_equipe', conector: 'a1', tamanho: '1,2 MB', quando: 'agora', por: usuario.nome, dados: { origem: 'malote' } })
              loja.registrar(usuario.nome, `Registrou o malote recebido de ${cliente.nome} (origem “malote” em Arquivos)`)
              loja.toast('Malote registrado em Arquivos, com origem “malote”.')
            }}
          >
            <PackageIcon /> Registrar malote recebido
          </Button>
        )}
      </div>
    </div>
  )
}

const entrega: DefWidget = {
  id: 'entrega',
  titulo: 'Preferência de entrega',
  atividades: 'C2-09',
  descricao: 'Digital, malote, motoboy ou retirada; protocolo de devolução',
  icone: PackageIcon,
  tamanhos: ['M', 'G'],
  conteudo: () => <Entrega />,
}

/* ---------- Arquivos repetidos (D-05, como ideia) ---------- */

function Repetidos() {
  const { cliente, podeSoc } = useAbaSoc()
  const lista = useColecao<Repetido>('repetidos', repetidosSemente, (r) => r.cliente_id === cliente?.id && !r.resolvido)
  const docs = useDocumentos()
  const { usuario } = useSessao()
  if (!cliente) return null
  if (!lista.length) return <p className="text-muted-foreground text-sm">Nenhum arquivo salvo duas vezes.</p>
  return (
    <ul className="flex flex-col gap-2">
      {lista.map((r) => (
        <li key={r.id} className="bg-sunken flex flex-col gap-1.5 rounded-[14px] px-3 py-2 text-sm">
          <span className="flex items-center gap-1.5">
            <CopyIcon className="text-muted-foreground size-4" /> Mesmo arquivo salvo duas vezes (hash {r.hash})
          </span>
          <span className="text-muted-foreground text-xs">{r.arquivos.join(' · ')}</span>
          <span className="flex flex-wrap gap-1">
            <Button size="sm" variant="ghost" className="h-7 rounded-full" onClick={() => r.arquivos.forEach((a) => docs.abrir(a, { clienteId: cliente.id }))}>
              Abrir os dois
            </Button>
            {podeSoc && (
              <Button size="sm" variant="outline" className="h-7 rounded-full" onClick={() => colRepetidos.atualizar(r.id, { resolvido: usuario.nome }, { texto: `${usuario.nome} marcou ${r.arquivos[1]} como cópia de ${r.arquivos[0]}` })}>
                Manter o primeiro
              </Button>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

const repetidos: DefWidget = {
  id: 'repetidos',
  titulo: 'Arquivos repetidos',
  atividades: 'D-05',
  descricao: 'Aviso do mesmo arquivo salvo duas vezes',
  icone: CopyIcon,
  tamanhos: ['M', 'G'],
  conteudo: () => <Repetidos />,
}

/* ---------- Carteira ---------- */

function CertificadosCarteira() {
  const lista = useColecao<Credencial>('credenciais', credenciaisSemente)
  const clientes = useTabela('cliente')
  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? id
  const ordenados = [...lista].sort((a, b) => a.validade.localeCompare(b.validade))
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {ordenados.map((c) => (
        <Linha key={c.id} titulo={nome(c.cliente_id)} detalhe={`${c.tipo}${c.situacao === 'pedido_ao_cliente' ? ' · régua em andamento' : ''}`} fim={<Dias dias={dias(c.validade)} />} />
      ))}
    </ul>
  )
}

function ReguaCertificados() {
  const { gestor } = useAbaSoc()
  const trabalhar = useAgenteS02()
  const lista = useColecao<Credencial>('credenciais', credenciaisSemente, (c) => c.situacao === 'valido' && !c.sem_arquivo && dias(c.validade) <= 60)
  if (!gestor || !lista.length) return null
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 rounded-full px-2 text-xs"
      onClick={() =>
        trabalhar({
          setor: 'societario',
          titulo: `Régua de ${lista.length} certificados`,
          atividade: 'SOC-009',
          etapas: ['Separando os certificados que vencem em 60 dias', 'Preparando um pedido por cliente'],
          texto: `Preparei a régua de renovação para ${lista.length} clientes, um pedido por cliente pelo app.`,
          cartao: { acao: { tipo: 'societario.regua_certificados', ids: lista.map((c) => c.id) }, resumo: `Régua de renovação · ${lista.length} certificados`, argumentos: [['Certificados', String(lista.length)]] },
        })
      }
    >
      Régua em lote
    </Button>
  )
}

registrarExecutor('societario.regua_certificados', (acao, { loja, quem }) => {
  const ids = acao.ids as string[]
  ids.forEach((id) => colCredenciais.atualizar(id, { situacao: 'pedido_ao_cliente' }, { texto: `${quem} aprovou a régua de renovação do certificado` }))
  loja.toast(`Régua ligada para ${ids.length} certificados: cada cliente recebe o pedido no app.`)
})

const certificadosCarteira: DefWidget = {
  id: 'carteira-certificados',
  titulo: 'Certificados a vencer',
  atividades: 'SOC-009',
  descricao: 'Certificados da carteira pela validade, com a régua',
  icone: CertificateIcon,
  tamanhos: ['G', 'XL'],
  acao: <ReguaCertificados />,
  conteudo: () => <CertificadosCarteira />,
}

const estadosCarteiraLista: EstadoCiclo[] = ['prospect', 'proposta', 'aceito', 'em_implantacao', 'ativo', 'em_saida', 'em_baixa', 'inativo', 'encerrado']

function EstadosCarteira({ t }: { t: TamanhoWidget }) {
  const clientes = useTabela('cliente')
  const nav = useNavegacao()
  const [aberto, setAberto] = useState<EstadoCiclo | null>(null)
  const ativos = clientes.filter((c) => !c.arquivado_em && c.servicos_contratados.includes('contabil'))
  const porEstado = estadosCarteiraLista.map((e) => [e, ativos.filter((c) => c.estado_ciclo === e)] as const).filter(([e, l]) => l.length || ['prospect', 'em_implantacao', 'ativo', 'em_saida'].includes(e))
  return (
    <div className="flex h-full flex-col gap-2">
      <div className={cn('grid gap-2', t === 'M' ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4')}>
        {porEstado.slice(0, t === 'M' ? 4 : 8).map(([e, l]) => (
          <button key={e} type="button" aria-pressed={aberto === e} onClick={() => setAberto(aberto === e ? null : e)} className={cn('flex min-w-0 cursor-pointer flex-col rounded-[12px] px-2 py-1 text-left', aberto === e ? 'bg-raised shadow-cartao' : 'hover:bg-sunken')}>
            <span className="font-heading text-2xl font-light tabular-nums">{l.length}</span>
            <span className="text-muted-foreground truncate text-[11px]">{rotuloEstado[e]}</span>
          </button>
        ))}
      </div>
      {aberto && t !== 'M' && (
        <ul className="flex flex-col gap-0.5 text-sm">
          {(porEstado.find(([e]) => e === aberto)?.[1] ?? []).map((c) => (
            <li key={c.id}>
              <button type="button" className="hover:bg-sunken w-full cursor-pointer rounded-lg px-1 text-left" onClick={() => nav.irPara({ modulo: 'painel', aba: 'societario', cliente: c.id })}>
                {c.codigo} - {c.nome}
              </button>
            </li>
          ))}
          {!(porEstado.find(([e]) => e === aberto)?.[1] ?? []).length && <li className="text-muted-foreground">Nenhum cliente neste estado.</li>}
        </ul>
      )}
    </div>
  )
}

function BotaoCadastrar() {
  const { podeSoc } = useAbaSoc()
  const [aberto, setAberto] = useState(false)
  if (!podeSoc) return null
  return (
    <>
      <Button size="sm" variant="ghost" className="h-6 rounded-full px-2 text-xs" onClick={() => setAberto(true)}>
        <PlusIcon className="size-3.5" /> Cadastrar pelo CNPJ
      </Button>
      {aberto && <GavetaCadastrarCnpj onFechar={() => setAberto(false)} />}
    </>
  )
}

const estadosCarteira: DefWidget = {
  id: 'carteira-estados',
  titulo: 'Clientes por estado',
  atividades: 'CIC-001, SOC-001',
  descricao: 'Quantos clientes em cada estado do ciclo; clicar lista; cadastrar pelo CNPJ',
  icone: BuildingsIcon,
  tamanhos: ['M', 'G'],
  acao: <BotaoCadastrar />,
  conteudo: (t) => <EstadosCarteira t={t} />,
}

function AcessosCarteira() {
  const lista = useColecao<AcessoOrgao>('acessos', acessosSemente, (a) => a.situacao !== 'confirmada')
  const clientes = useTabela('cliente')
  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? id
  if (!lista.length) return <EstadoVazio compacto titulo="Nenhum acesso pendente" descricao="Todas as procurações e senhas da carteira estão confirmadas." />
  return (
    <Tabela colunas={[{ rotulo: 'Cliente' }, { rotulo: 'Acesso' }, { rotulo: 'Parado há', direita: true }, { rotulo: 'Cobranças', direita: true }]} minimo={420}>
      {lista.map((a) => (
        <tr key={a.id}>
          <td className="py-1.5 pr-2">{nome(a.cliente_id)}</td>
          <td className="text-muted-foreground py-1.5 pr-2">
            {a.orgao} · {a.servico}
          </td>
          <td className="py-1.5 pr-2 text-right tabular-nums">{a.pedida_em ? `${diasEntre(a.pedida_em, HOJE_DEMO)} dias` : '—'}</td>
          <td className="py-1.5 text-right tabular-nums">{a.cobrancas ?? 0}</td>
        </tr>
      ))}
    </Tabela>
  )
}

function LotePedirAcessos() {
  const { gestor } = useAbaSoc()
  const trabalhar = useAgenteS02()
  const lista = useColecao<AcessoOrgao>('acessos', acessosSemente, (a) => a.situacao !== 'confirmada')
  if (!gestor || !lista.length) return null
  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-6 rounded-full px-2 text-xs"
      onClick={() =>
        trabalhar({
          setor: 'gestao_atendimento',
          titulo: `Pedir ${lista.length} autorizações paradas`,
          atividade: 'SOC-014',
          etapas: ['Separando os clientes parados em SOC-014 e SOC-011', 'Escrevendo o passo a passo de cada órgão'],
          texto: `Preparei ${lista.length} pedidos, um por cliente, com o passo a passo do órgão. Aprove para eu mandar pelo app.`,
          cartao: { acao: { tipo: 'societario.pedir_acessos_lote', ids: lista.map((a) => a.id) }, resumo: `Pedir ${lista.length} autorizações de acesso`, argumentos: [['Clientes', String(new Set(lista.map((a) => a.cliente_id)).size)]] },
        })
      }
    >
      Pedir a todos
    </Button>
  )
}

registrarExecutor('societario.pedir_acessos_lote', (acao, { loja, quem }) => {
  const ids = acao.ids as string[]
  ids.forEach((id) => {
    const a = colAcessos.obter(id)
    if (a) colAcessos.atualizar(id, { situacao: 'pedida', pedida_em: a.pedida_em ?? HOJE_DEMO, cobrancas: (a.cobrancas ?? 0) + 1 }, { texto: `${quem} aprovou o pedido de ${a.servico} (lote)` })
  })
  loja.toast(`${ids.length} pedidos de autorização enviados pelo app, com o passo a passo.`)
})

const acessosCarteira: DefWidget = {
  id: 'carteira-acessos',
  titulo: 'Acessos pendentes',
  atividades: 'SOC-011, 014',
  descricao: 'Clientes parados em procuração e acesso, com dias e cobranças',
  icone: KeyIcon,
  tamanhos: ['G', 'XL'],
  acao: <LotePedirAcessos />,
  conteudo: () => <AcessosCarteira />,
}

function LicencasCarteira() {
  const lista = useColecao<Licenca>('licencas', licencasSemente)
  const clientes = useTabela('cliente')
  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? id
  const ordenadas = useMemo(() => [...lista].sort((a, b) => a.validade.localeCompare(b.validade)), [lista])
  return (
    <ul className="divide-border/70 flex flex-col divide-y">
      {ordenadas.map((l) => (
        <Linha key={l.id} titulo={l.nome} detalhe={`${nome(l.cliente_id)} · ${l.orgao}`} fim={<Dias dias={dias(l.validade)} />} />
      ))}
    </ul>
  )
}

const licencasCarteira: DefWidget = {
  id: 'carteira-licencas',
  titulo: 'Licenças e renovações',
  atividades: 'C2-20, C2-22, SOC-036 a 040',
  descricao: 'Vencimentos de alvarás, AVCB, conselhos e vigilância da carteira',
  icone: StampIcon,
  tamanhos: ['G', 'XL'],
  conteudo: () => <LicencasCarteira />,
}


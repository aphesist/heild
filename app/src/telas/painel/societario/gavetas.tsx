import { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { registrarExecutor, useAgenteS02 } from '@/ambiente/agente-s02'
import { useLoja } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { EstadoErro, SeloDemonstracao, useConfirmar } from '@/components/kit'
import { Campo, CampoArea, CampoEscolha, CampoTexto, Fichas, GavetaFormulario, Interruptor } from '@/components/ui/formulario'
import { ddmm, HOJE_DEMO, itensDeObrigacao } from '@/dados/obrigacoes-setor'
import { banco } from '@/nucleo/banco'
import type { Cliente, EstadoCiclo, Regime, VersaoPerfil } from '@/nucleo/modelo/entidades'
import { useTabela } from '@/nucleo/react'
import { registrar, repos } from '@/nucleo/repositorios'
import { servicos, type DadosCnpj } from '@/servicos'
import { cnpjValido, formatarCnpj, soDigitos } from '@/servicos/cadastros'
import { rotuloEstado } from '../anatomia'
import { checklistPadrao, colAcessos, colCredenciais, colProcessos, type Credencial, type Processo } from './dados'

/* ---------- Rótulos ---------- */

export const rotuloRegime: Record<Regime, string> = { simples: 'Simples Nacional', presumido: 'Lucro Presumido', real: 'Lucro Real', mei: 'MEI', imune_isento: 'Imune/isento', pf: 'Pessoa física' }
const regimes = Object.entries(rotuloRegime).map(([valor, rotulo]) => ({ valor: valor as Regime, rotulo }))
const ufs = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'GO', 'DF', 'PE', 'CE', 'ES']
const estadosOrdem: EstadoCiclo[] = ['prospect', 'proposta', 'aceito', 'em_implantacao', 'ativo', 'inativo', 'em_saida', 'em_baixa', 'encerrado']

const erroTexto = (e: unknown) => (e instanceof Error ? e.message : String(e))

/* ---------- S02-A19: cadastrar pelo CNPJ (SOC-001, integrante faz sozinho) ---------- */

export function GavetaCadastrarCnpj({ onFechar }: { onFechar: () => void }) {
  const loja = useLoja()
  const trabalhar = useAgenteS02()
  const clientes = useTabela('cliente')
  const [cnpj, setCnpj] = useState('')
  const [codigo, setCodigo] = useState(String(Math.max(0, ...clientes.map((c) => Number(c.codigo) || 0)) + 1))
  const [regime, setRegime] = useState<Regime>('simples')
  const [servicosC, setServicosC] = useState<string[]>(['contabil'])
  const [estado, setEstado] = useState<'inicio' | 'consultando' | 'pronto' | 'erro'>('inicio')
  const [dados, setDados] = useState<DadosCnpj | null>(null)
  const [erro, setErro] = useState('')
  const valido = cnpjValido(cnpj)
  const repetido = clientes.find((c) => soDigitos(c.documento) === soDigitos(cnpj))
  const consultar = async () => {
    setEstado('consultando')
    try {
      const r = await servicos.cadastros.consultarCnpj(cnpj)
      setDados(r.dados)
      setRegime(r.dados.simples ? 'simples' : 'presumido')
      setEstado('pronto')
    } catch (e) {
      setErro(erroTexto(e))
      setEstado('erro')
    }
  }
  const salvar = () => {
    if (!dados) return
    const nome = dados.razao_social
    trabalhar({
      setor: 'societario',
      titulo: 'Cadastrar pelo CNPJ',
      cliente: nome,
      atividade: 'SOC-001',
      inicio: `Cadastrando ${nome} com os dados da Receita.`,
      etapas: ['Gravando o cadastro com os dados da Receita', 'Criando a primeira versão do perfil', `Ligando ${dados.qsa.length} sócios como pessoas`, 'Deixando o cliente em "aceito"'],
      seg: 0.8,
      texto: `${nome} cadastrado em “aceito”, com a primeira versão do perfil (${rotuloRegime[regime]}, ${dados.endereco.uf}) e os sócios na ficha. A trilha de implantação começa quando o Gestor mudar para “em implantação”.`,
      aviso: `${nome} cadastrado`,
      aoTerminar: () => {
        try {
          const c = repos.clientes.criar({ tipo: 'pj', codigo, documento: dados.cnpj, nome, estado_ciclo: 'aceito', estado_ciclo_desde: HOJE_DEMO, regime, servicos_contratados: servicosC, extras: { servicos_definidos: true, cnae: dados.cnae_principal.codigo, cadastrado_por: 'SOC-001' } }, { texto: `Societário cadastrou ${nome} pelo CNPJ (SOC-001)` })
          repos.versoesPerfil.criar({ cliente_id: c.id, vigente_de: HOJE_DEMO, regime, cnaes: [dados.cnae_principal.codigo, ...dados.cnaes_secundarios.map((x) => x.codigo)], uf: dados.endereco.uf, servicos_contratados: servicosC, motivo_versao: 'Cadastro inicial pelo CNPJ', fonte: 'receita_federal' }, { texto: `Primeira versão do perfil de ${nome}` })
          loja.salvarFicha({ id: c.id, contatos: dados.qsa.map((s, i) => ({ nome: s.nome, papel: i === 0 ? 'sócio' : 'sócia', assuntos: i === 0 ? ['societario', 'comunicados', 'guias'] : [] })), responsaveis: {}, conversas: {} })
        } catch (e) {
          loja.toastErro(erroTexto(e))
        }
      },
    })
    onFechar()
  }
  return (
    <GavetaFormulario aberta onFechar={onFechar} titulo="Cadastrar cliente pelo CNPJ" descricao="A consulta preenche razão social, CNAE, endereço e sócios. O cliente nasce em “aceito”, com a primeira versão do perfil." acao={estado === 'pronto' ? 'Cadastrar' : 'Consultar'} acaoDesabilitada={estado === 'consultando' || !valido || !!repetido} onAcao={estado === 'pronto' ? salvar : consultar}>
      <Campo rotulo="CNPJ" erro={cnpj && !valido ? 'CNPJ inválido (confira os dígitos).' : repetido ? `Já é cliente: ${repetido.codigo} - ${repetido.nome}.` : undefined} ajuda="Para testar: 11.222.333/0001-81">
        {(id) => (
          <CampoTexto
            id={id}
            mono
            valor={cnpj}
            onMudar={(v) => {
              setCnpj(formatarCnpj(v).slice(0, 18) || v)
              setEstado('inicio')
            }}
            placeholder="00.000.000/0000-00"
          />
        )}
      </Campo>
      {estado === 'consultando' && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <MagnifyingGlassIcon className="size-4 animate-pulse" /> Consultando a Receita…
        </p>
      )}
      {estado === 'erro' && <EstadoErro titulo="A consulta não respondeu" descricao={erro} onTentar={consultar} />}
      {estado === 'pronto' && dados && (
        <div className="bg-sunken flex flex-col gap-2 rounded-[14px] p-3 text-sm">
          <div className="flex items-center gap-2">
            <strong className="font-medium">{dados.razao_social}</strong>
            <SeloDemonstracao fonte="consulta CNPJ (API-12)" />
          </div>
          <span className="text-muted-foreground">
            {dados.situacao} · aberta em {ddmm(dados.abertura)}/{dados.abertura.slice(0, 4)} · {dados.natureza}
          </span>
          <span>
            CNAE {dados.cnae_principal.codigo} · {dados.cnae_principal.descricao}
          </span>
          <span className="text-muted-foreground">
            {dados.endereco.logradouro}, {dados.endereco.numero} · {dados.endereco.municipio}/{dados.endereco.uf}
          </span>
          <span>Sócios: {dados.qsa.map((s) => `${s.nome} (${s.qualificacao}${s.participacao ? `, ${s.participacao}` : ''})`).join('; ')}</span>
        </div>
      )}
      {estado === 'pronto' && (
        <>
          <Campo rotulo="Código interno">{(id) => <CampoTexto id={id} valor={codigo} onMudar={setCodigo} />}</Campo>
          <Campo rotulo="Regime" ajuda={dados?.simples ? 'A Receita diz optante do Simples.' : undefined}>
            {(id) => <CampoEscolha id={id} valor={regime} onMudar={(v) => setRegime(v as Regime)} opcoes={regimes} />}
          </Campo>
          <Campo rotulo="Serviços contratados">
            {() => (
              <Fichas
                rotulo="Serviços"
                valores={servicosC}
                onMudar={(v) => setServicosC(v.length ? v : ['contabil'])}
                opcoes={[
                  { valor: 'contabil', rotulo: 'Contábil' },
                  { valor: 'bpo', rotulo: 'BPO financeiro' },
                ]}
              />
            )}
          </Campo>
        </>
      )}
    </GavetaFormulario>
  )
}

/* ---------- S02-A20 e A22: versionar o perfil (com diff; cartão; regera o calendário) ---------- */

export function GavetaVersionar({ cliente, inicial, motivoInicial, onFechar }: { cliente: Cliente; inicial?: Partial<Pick<VersaoPerfil, 'regime' | 'uf' | 'cnaes'>>; motivoInicial?: string; onFechar: () => void }) {
  const versoes = useTabela('versao_perfil')
  const trabalhar = useAgenteS02()
  const vigente = versoes.filter((v) => v.cliente_id === cliente.id && !v.vigente_ate).at(-1)
  const [regime, setRegime] = useState<Regime>(inicial?.regime ?? vigente?.regime ?? cliente.regime)
  const [uf, setUf] = useState(inicial?.uf ?? vigente?.uf ?? 'SP')
  const [cnaes, setCnaes] = useState((inicial?.cnaes ?? vigente?.cnaes ?? []).join(', '))
  const [vigencia, setVigencia] = useState('2026-12-01')
  const [motivo, setMotivo] = useState(motivoInicial ?? '')
  const novos = cnaes.split(',').map((x) => x.trim()).filter(Boolean)
  const diff = [regime !== (vigente?.regime ?? cliente.regime) && ['Regime', rotuloRegime[vigente?.regime ?? cliente.regime], rotuloRegime[regime]], uf !== (vigente?.uf ?? 'SP') && ['UF', vigente?.uf ?? 'SP', uf], novos.join(',') !== (vigente?.cnaes ?? []).join(',') && ['CNAEs', (vigente?.cnaes ?? []).join(', ') || '—', novos.join(', ') || '—']].filter(Boolean) as [string, string, string][]
  const valido = diff.length > 0 && motivo.trim().length >= 4 && /^\d{4}-\d{2}-\d{2}$/.test(vigencia)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Versionar o perfil · ${cliente.nome}`}
      descricao="Mudar campo do perfil fecha a versão vigente e abre outra na data escolhida. Vai em cartão; aprovado, o calendário das obrigações futuras é regerado."
      acao="Preparar o cartão"
      acaoDesabilitada={!valido}
      onAcao={() => {
        trabalhar({
          setor: 'societario',
          titulo: 'Versionar o perfil',
          cliente: cliente.nome,
          clienteId: cliente.id,
          atividade: 'SOC-002',
          etapas: ['Conferindo a mudança com o cadastro', 'Simulando o efeito no calendário de obrigações'],
          seg: 0.9,
          texto: `Preparei a versão nova do perfil de ${cliente.nome} a partir de ${ddmm(vigencia)}: ${diff.map(([c, a, b]) => `${c} ${a} → ${b}`).join('; ')}. Aprovado, eu regero as obrigações futuras não iniciadas.`,
          cartao: { acao: { tipo: 'cliente.versionar_perfil', clienteId: cliente.id, regime, uf, cnaes: novos, vigencia, motivo }, resumo: 'Versionar o perfil', argumentos: [...diff.map(([c, a, b]) => [c, `${a} → ${b}`] as [string, string]), ['Vigente de', ddmm(vigencia)], ['Motivo', motivo]] },
        })
        onFechar()
      }}
    >
      <Campo rotulo="Regime">{(id) => <CampoEscolha id={id} valor={regime} onMudar={(v) => setRegime(v as Regime)} opcoes={regimes} />}</Campo>
      <Campo rotulo="UF">{(id) => <CampoEscolha id={id} valor={uf} onMudar={setUf} opcoes={ufs.map((u) => ({ valor: u, rotulo: u }))} />}</Campo>
      <Campo rotulo="CNAEs" ajuda="Separe por vírgula.">
        {(id) => <CampoTexto id={id} valor={cnaes} onMudar={setCnaes} />}
      </Campo>
      <Campo rotulo="Vigente a partir de" erro={/^\d{4}-\d{2}-\d{2}$/.test(vigencia) ? undefined : 'Escolha a data.'}>
        {(id) => <CampoTexto id={id} tipo="date" valor={vigencia} onMudar={setVigencia} />}
      </Campo>
      <Campo rotulo="Motivo" erro={motivo && motivo.trim().length < 4 ? 'Diga o motivo da mudança.' : undefined}>
        {(id) => <CampoArea id={id} linhas={2} valor={motivo} onMudar={setMotivo} placeholder="Ex.: alteração contratual registrada na JUCESP" />}
      </Campo>
      <div className="bg-sunken rounded-[14px] p-3 text-sm">
        <p className="mb-1 font-medium">O que muda</p>
        {diff.length ? (
          <ul className="flex flex-col gap-1">
            {diff.map(([c, a, b]) => (
              <li key={c}>
                {c}: <span className="text-muted-foreground line-through">{a}</span> → <strong className="font-medium">{b}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">Nada mudou ainda. Para corrigir um erro de digitação sem versão nova, use “corrigir digitação”.</p>
        )}
      </div>
    </GavetaFormulario>
  )
}

/** Aprovado: fecha a vigente, abre a nova, atualiza o cliente e marca as futuras como regeradas (03, 6.2). */
registrarExecutor('cliente.versionar_perfil', (acao, { loja, quem }) => {
  const clienteId = String(acao.clienteId)
  const vigente = banco.ler('versao_perfil').filter((v) => v.cliente_id === clienteId && !v.vigente_ate).at(-1)
  const vigencia = String(acao.vigencia)
  try {
    if (vigente) repos.versoesPerfil.atualizar(vigente.id, { vigente_ate: vigencia }, { texto: `Versão do perfil fechada em ${ddmm(vigencia)}` })
    const base = vigente ?? ({ servicos_contratados: ['contabil'], fonte: 'manual' } as Partial<VersaoPerfil>)
    repos.versoesPerfil.criar({ cliente_id: clienteId, vigente_de: vigencia, vigente_ate: null, regime: acao.regime as Regime, uf: String(acao.uf), cnaes: acao.cnaes as string[], servicos_contratados: base.servicos_contratados ?? ['contabil'], motivo_versao: String(acao.motivo), fonte: acao.receita ? 'receita_federal' : 'manual', extras: { ...(vigente?.extras ?? {}), aprovado_por: quem } }, { ferramenta: 'cliente.versionar_perfil', texto: `${quem} aprovou a versão nova do perfil: ${String(acao.motivo)}` })
    repos.clientes.atualizar(clienteId, { regime: acao.regime as Regime }, { ferramenta: 'cliente.versionar_perfil', texto: `Perfil do cliente versionado (${String(acao.motivo)})` })
    const futuras = repos.tarefas.listar((t) => t.cliente_id === clienteId && t.origem === 'obrigacao' && t.status === 'a_fazer' && (t.prazo_legal ?? '') >= vigencia)
    futuras.forEach((t) => repos.tarefas.atualizar(t.id, { extras: { ...t.extras, regerada: true } }, { ferramenta: 'cliente.versionar_perfil', texto: `Regerada por mudança de perfil: ${t.titulo}` }))
    if (acao.divergenciaId) {
      const lista = (banco.ler('registro_tela').find((r) => r.id === 's02:divergencias-resolvidas')?.valor as string[] | undefined) ?? []
      repos.telas.lembrar('s02:divergencias-resolvidas', [...lista, String(acao.divergenciaId)])
    }
    loja.toast(`Perfil versionado a partir de ${ddmm(vigencia)}. ${futuras.length ? `${futuras.length} obrigações futuras regeradas.` : 'Calendário conferido: nada a regerar.'}`, { modulo: 'painel', aba: 'obrigacoes', cliente: clienteId }, 'Ver obrigações')
  } catch (e) {
    loja.toastErro(erroTexto(e))
  }
})

/* ---------- S02-A21: corrigir digitação (no lugar, com registro) ---------- */

export function GavetaCorrigir({ cliente, onFechar }: { cliente: Cliente; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const versoes = useTabela('versao_perfil')
  const vigente = versoes.filter((v) => v.cliente_id === cliente.id && !v.vigente_ate).at(-1)
  const [nome, setNome] = useState(cliente.nome)
  const [documento, setDocumento] = useState(cliente.documento)
  const [municipio, setMunicipio] = useState(vigente?.municipio_ibge ?? '')
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Corrigir digitação"
      descricao="Corrige a versão atual sem criar outra (01, P2). Fica “corrigido por você em tal data”. Para mudança de verdade (regime, endereço, sócios), versione."
      acao="Corrigir"
      acaoDesabilitada={!nome.trim() || !documento.trim()}
      onAcao={() => {
        const antes = repos.clientes.obter(cliente.id)!
        try {
          repos.clientes.atualizar(cliente.id, { nome: nome.trim(), documento: documento.trim() }, { ferramenta: 'cliente.corrigir_perfil', texto: `${usuario.nome} corrigiu a digitação do cadastro de ${antes.nome}` })
          if (vigente) repos.versoesPerfil.atualizar(vigente.id, { municipio_ibge: municipio || undefined, extras: { ...vigente.extras, corrigido_por: usuario.nome, corrigido_em: new Date().toLocaleDateString('pt-BR') } }, { ferramenta: 'cliente.corrigir_perfil', texto: `${usuario.nome} corrigiu a versão vigente do perfil` })
          loja.toastDesfazer('Corrigido na versão atual, com o seu nome e a data.', () => repos.clientes.reverter(antes))
          onFechar()
        } catch (e) {
          loja.toastErro(erroTexto(e))
        }
      }}
    >
      <Campo rotulo="Razão social">{(id) => <CampoTexto id={id} valor={nome} onMudar={setNome} />}</Campo>
      <Campo rotulo="CNPJ ou CPF">{(id) => <CampoTexto id={id} mono valor={documento} onMudar={setDocumento} />}</Campo>
      <Campo rotulo="Código do município (IBGE)">{(id) => <CampoTexto id={id} valor={municipio} onMudar={setMunicipio} placeholder="3550308" />}</Campo>
    </GavetaFormulario>
  )
}

/* ---------- S02-A25: pedir procuração ou acesso; registrar fora da RFB ---------- */

const orgaos = [
  { orgao: 'e-CAC', servico: 'Procuração eletrônica (todos os serviços)', passos: 'Entrar no e-CAC com o gov.br do sócio › Senhas e procurações › Cadastrar procuração › CNPJ do escritório › todos os serviços › 5 anos.' },
  { orgao: 'DET', servico: 'Domicílio Eletrônico Trabalhista', passos: 'Entrar no DET com o gov.br › Procurações › Cadastrar › CNPJ do escritório.' },
  { orgao: 'Prefeitura', servico: 'Senha web · NFS-e', passos: 'Cadastrar o escritório como contador responsável no portal da prefeitura ou mandar a senha pelo app (vai direto ao cofre).' },
  { orgao: 'SEFAZ', servico: 'Procuração estadual', passos: 'No posto fiscal eletrônico, cadastrar o escritório como contabilista responsável.' },
  { orgao: 'gov.br', servico: 'Conta prata ou ouro do sócio', passos: 'Subir a conta do gov.br para prata pelo app do banco (passo a passo de 3 minutos).' },
]

export function GavetaPedirAcesso({ cliente, onFechar, registrarFora }: { cliente: Cliente; onFechar: () => void; registrarFora?: boolean }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const trabalhar = useAgenteS02()
  const [i, setI] = useState(0)
  const [validade, setValidade] = useState('2031-11')
  const o = orgaos[i]
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={registrarFora ? 'Registrar procuração fora da RFB' : 'Pedir procuração ou acesso'}
      descricao={registrarFora ? 'Procuração já feita em outro órgão: fica registrada com a validade (sem guardar o conteúdo).' : 'Vira pendência no app do cliente com o passo a passo; a régua cobra até chegar. O Atendimento faz o pedido.'}
      acao={registrarFora ? 'Registrar' : 'Pedir ao cliente'}
      onAcao={() => {
        if (registrarFora) {
          colAcessos.criar({ cliente_id: cliente.id, orgao: o.orgao, servico: o.servico, validade, situacao: 'confirmada', fora_rfb: true }, { texto: `${usuario.nome} registrou procuração ${o.orgao} de ${cliente.nome} até ${validade}` })
          loja.toast(`Procuração ${o.orgao} registrada até ${validade}.`)
          return onFechar()
        }
        trabalhar({
          setor: 'gestao_atendimento',
          titulo: `Pedir ${o.servico}`,
          cliente: cliente.nome,
          clienteId: cliente.id,
          atividade: 'SOC-014',
          etapas: ['Escolhendo quem recebe o assunto societário', 'Escrevendo o passo a passo em linguagem simples', 'Publicando a pendência no app e ligando a régua'],
          seg: 0.8,
          texto: `Pedi ${o.servico.toLowerCase()} a ${cliente.nome} pelo app, com o passo a passo. A régua cobra em 2, 5 e 10 dias; quando a procuração aparecer, o Societário confirma sozinho.`,
          aoTerminar: () => {
            const existente = colAcessos.listar().find((a) => a.cliente_id === cliente.id && a.orgao === o.orgao)
            if (existente) colAcessos.atualizar(existente.id, { situacao: 'pedida', pedida_em: HOJE_DEMO, cobrancas: (existente.cobrancas ?? 0) + 1 }, { texto: `Atendimento pediu ${o.servico} a ${cliente.nome}` })
            else colAcessos.criar({ cliente_id: cliente.id, orgao: o.orgao, servico: o.servico, validade: 'pedida', situacao: 'pedida', fora_rfb: o.orgao !== 'e-CAC', pedida_em: HOJE_DEMO, cobrancas: 1 }, { texto: `Atendimento pediu ${o.servico} a ${cliente.nome}` })
            repos.tarefas.criar({ cliente_id: cliente.id, setor_id: 'societario', atividade_id: 'SOC-014', titulo: `Receber ${o.servico} · ${cliente.nome}`, origem: 'integrante', quem_conclui: 'agente_sozinho', status: 'aguardando_cliente', status_desde: new Date().toISOString(), prioridade: 'normal', checklist: o.passos.split(' › ').map((item) => ({ item, feito: false })), risco: false, aguardando_detalhe: { itens: [o.servico] }, extras: { responsavel_nome: 'Societário', responsavel_tipo_tela: 'integrante', responsavel_setor: 'societario', acao_externa: true } }, { texto: `Pendência de ação externa no app: ${o.servico}` })
          },
        })
        onFechar()
      }}
    >
      <Campo rotulo="Órgão e serviço">{(id) => <CampoEscolha id={id} valor={String(i)} onMudar={(v) => setI(Number(v))} opcoes={orgaos.map((x, k) => ({ valor: String(k), rotulo: `${x.orgao} · ${x.servico}` }))} />}</Campo>
      {registrarFora ? (
        <Campo rotulo="Validade (mês/ano)">{(id) => <CampoTexto id={id} tipo="month" valor={validade} onMudar={setValidade} />}</Campo>
      ) : (
        <div className="bg-sunken rounded-[14px] p-3 text-sm">
          <p className="mb-1 font-medium">Passo a passo que o cliente vê no app</p>
          <ol className="text-muted-foreground list-decimal pl-4">
            {o.passos.split(' › ').map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
        </div>
      )}
    </GavetaFormulario>
  )
}

/* ---------- S02-A28: registrar A3 (sem arquivo) ---------- */

export function GavetaRegistrarA3({ cliente, onFechar }: { cliente: Cliente; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [tipo, setTipo] = useState<Credencial['tipo']>('e-CNPJ A3')
  const [titular, setTitular] = useState(cliente.nome)
  const [validade, setValidade] = useState('')
  const [usos, setUsos] = useState('e-CAC, SPED')
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(validade) && validade > HOJE_DEMO
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Registrar certificado A3"
      descricao="O A3 fica com o cliente (cartão ou token): aqui só o registro com validade e serviços. Nunca o arquivo nem a senha."
      acao="Registrar"
      acaoDesabilitada={!ok || !titular.trim()}
      onAcao={() => {
        const c = colCredenciais.criar({ cliente_id: cliente.id, tipo, titular: titular.trim(), validade, servicos: usos.split(',').map((x) => x.trim()).filter(Boolean), situacao: 'valido', sem_arquivo: true, trilha: [{ quando: new Date().toISOString(), quem: usuario.nome, uso: 'registro do certificado (sem arquivo)' }] }, { texto: `${usuario.nome} registrou ${tipo} de ${cliente.nome} (validade ${ddmm(validade)})` })
        loja.toastDesfazer(`${tipo} registrado até ${ddmm(validade)}/${validade.slice(0, 4)}.`, () => {
          const lista = colCredenciais.listar().filter((x) => x.id !== c.id)
          repos.telas.lembrar('s02:credenciais', lista)
        })
        onFechar()
      }}
    >
      <Campo rotulo="Tipo">{(id) => <CampoEscolha id={id} valor={tipo} onMudar={(v) => setTipo(v as Credencial['tipo'])} opcoes={(['e-CNPJ A3', 'e-CPF A3'] as const).map((x) => ({ valor: x, rotulo: x }))} />}</Campo>
      <Campo rotulo="Titular">{(id) => <CampoTexto id={id} valor={titular} onMudar={setTitular} />}</Campo>
      <Campo rotulo="Validade" erro={validade && !ok ? 'A validade precisa ser futura.' : undefined}>
        {(id) => <CampoTexto id={id} tipo="date" valor={validade} onMudar={setValidade} />}
      </Campo>
      <Campo rotulo="Serviços autorizados" ajuda="Separe por vírgula.">
        {(id) => <CampoTexto id={id} valor={usos} onMudar={setUsos} />}
      </Campo>
    </GavetaFormulario>
  )
}

/* ---------- S02-A31 e A32: abrir processo de legalização; andamento e exigência ---------- */

export function GavetaAbrirProcesso({ cliente, onFechar }: { cliente: Cliente; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [tipo, setTipo] = useState<Processo['tipo']>('alteração')
  const [orgao, setOrgao] = useState('JUCESP')
  const [uf, setUf] = useState('SP')
  const [titulo, setTitulo] = useState('')
  const itens = useMemo(() => checklistPadrao(tipo, uf), [tipo, uf])
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo="Abrir processo de legalização"
      descricao="Vira tarefa do Societário com o checklist do órgão e da UF; o andamento e as exigências ficam na linha do tempo do processo."
      acao="Abrir"
      acaoDesabilitada={titulo.trim().length < 4}
      onAcao={() => {
        const t = repos.tarefas.criar({ cliente_id: cliente.id, setor_id: 'societario', atividade_id: tipo === 'abertura' ? 'SOC-025' : tipo === 'alteração' ? 'SOC-027' : tipo === 'baixa' ? 'SOC-030' : tipo === 'fiscalização' ? 'C2-21' : 'SOC-032', titulo: `${titulo.trim()} · ${orgao}`, origem: 'pessoa', quem_conclui: 'pessoa', status: 'em_andamento', status_desde: new Date().toISOString(), prioridade: 'normal', checklist: itens.map((item) => ({ item, feito: false })), risco: false, responsavel_tipo: 'usuario', responsavel_id: usuario.id, extras: { responsavel_nome: usuario.nome, responsavel_tipo_tela: 'pessoa' } }, { texto: `${usuario.nome} abriu o processo ${titulo.trim()} (${orgao})` })
        colProcessos.criar({ cliente_id: cliente.id, orgao, tipo, titulo: titulo.trim(), uf, etapa: 'aberto', situacao: 'andamento', checklist: itens.map((item) => ({ item, feito: false })), andamentos: [{ quando: new Date().toISOString(), texto: 'Processo aberto', por: usuario.nome }], tarefa_id: t.id }, { texto: `Processo de ${tipo} aberto: ${titulo.trim()}` })
        loja.toast(`Processo aberto com ${itens.length} passos e a tarefa no Societário.`)
        onFechar()
      }}
    >
      <Campo rotulo="Tipo">
        {(id) => <CampoEscolha id={id} valor={tipo} onMudar={(v) => setTipo(v as Processo['tipo'])} opcoes={(['abertura', 'alteração', 'baixa', 'licença', 'renovação', 'fiscalização', 'regularização'] as const).map((x) => ({ valor: x, rotulo: x === 'fiscalização' ? 'fiscalização de licença (C2-21)' : x }))} />}
      </Campo>
      <Campo rotulo="Título" erro={titulo && titulo.trim().length < 4 ? 'Diga o que é o processo.' : undefined}>
        {(id) => <CampoTexto id={id} valor={titulo} onMudar={setTitulo} placeholder="Ex.: 5ª alteração contratual · mudança de endereço" />}
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Órgão">{(id) => <CampoTexto id={id} valor={orgao} onMudar={setOrgao} />}</Campo>
        <Campo rotulo="UF">{(id) => <CampoEscolha id={id} valor={uf} onMudar={setUf} opcoes={ufs.map((u) => ({ valor: u, rotulo: u }))} />}</Campo>
      </div>
      <div className="bg-sunken rounded-[14px] p-3 text-sm">
        <p className="mb-1 font-medium">Checklist ({uf})</p>
        <ul className="text-muted-foreground flex flex-col gap-0.5">
          {itens.map((i) => (
            <li key={i}>· {i}</li>
          ))}
        </ul>
      </div>
    </GavetaFormulario>
  )
}

export function GavetaProcesso({ processo, cliente, onFechar }: { processo: Processo; cliente: Cliente; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [texto, setTexto] = useState('')
  const [exigencia, setExigencia] = useState(false)
  const atual = colProcessos.obter(processo.id) ?? processo
  const marcar = (k: number) => {
    const checklist = atual.checklist.map((c, i) => (i === k ? { ...c, feito: !c.feito } : c))
    colProcessos.atualizar(atual.id, { checklist, situacao: checklist.every((c) => c.feito) ? 'concluido' : atual.situacao === 'concluido' ? 'andamento' : atual.situacao }, { texto: `${usuario.nome} marcou “${atual.checklist[k].item}” (${atual.titulo})` })
  }
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      largura="lg"
      titulo={atual.titulo}
      descricao={`${atual.orgao} · ${atual.tipo} · ${atual.uf}${atual.prazo ? ` · ${atual.prazo}` : ''}`}
      acao={texto.trim() ? 'Registrar andamento' : 'Fechar'}
      onAcao={() => {
        if (!texto.trim()) return onFechar()
        colProcessos.atualizar(atual.id, { etapa: exigencia ? `em exigência: ${texto.trim()}` : texto.trim(), situacao: exigencia ? 'exigencia' : 'andamento', andamentos: [...atual.andamentos, { quando: new Date().toISOString(), texto: `${exigencia ? 'Exigência: ' : ''}${texto.trim()}`, por: usuario.nome }] }, { texto: `${usuario.nome} registrou andamento em ${atual.titulo}: ${texto.trim()}` })
        if (exigencia)
          repos.tarefas.criar({ cliente_id: cliente.id, setor_id: 'societario', atividade_id: 'SOC-031', titulo: `Exigência · ${atual.titulo}: ${texto.trim()}`, origem: 'pessoa', quem_conclui: 'pessoa', status: 'aguardando_cliente', status_desde: new Date().toISOString(), prioridade: 'alta', checklist: [], risco: true, aguardando_detalhe: { itens: [texto.trim()] }, extras: { responsavel_nome: usuario.nome, responsavel_tipo_tela: 'pessoa' } }, { texto: `Exigência virou pendência: ${texto.trim()}` })
        loja.toast(exigencia ? 'Exigência registrada e virou pendência do cliente.' : 'Andamento registrado na linha do tempo do processo.')
        onFechar()
      }}
    >
      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Checklist</h3>
        {atual.checklist.map((c, k) => (
          <label key={c.item} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={c.feito} onChange={() => marcar(k)} className="accent-foreground size-4" />
            <span className={c.feito ? 'text-muted-foreground line-through' : ''}>{c.item}</span>
          </label>
        ))}
      </section>
      <section className="flex flex-col gap-1.5">
        <h3 className="text-sm font-medium">Linha do tempo</h3>
        <ol className="relative flex flex-col gap-2 border-l pl-4 text-sm">
          {[...atual.andamentos].reverse().map((a, i) => (
            <li key={i}>
              <span className="bg-foreground absolute -left-[4.5px] mt-1.5 size-2 rounded-full" />
              <span className="text-muted-foreground block text-xs">
                {new Date(a.quando).toLocaleDateString('pt-BR')} · {a.por}
              </span>
              {a.texto}
            </li>
          ))}
        </ol>
      </section>
      <Campo rotulo="Novo andamento">{(id) => <CampoArea id={id} linhas={2} valor={texto} onMudar={setTexto} placeholder="Ex.: JUCESP deferiu; aguardando o novo CNPJ" />}</Campo>
      <Interruptor ligado={exigencia} onMudar={setExigencia} rotulo="É exigência do órgão" detalhe="Vira pendência do cliente, com a régua." />
    </GavetaFormulario>
  )
}

/* ---------- S02-A34: mudar estado do ciclo (cartão; bloqueios) ---------- */

export function GavetaMudarEstado({ cliente, onFechar }: { cliente: Cliente; onFechar: () => void }) {
  const trabalhar = useAgenteS02()
  const tarefas = useTabela('tarefa')
  const [estado, setEstado] = useState<EstadoCiclo>(cliente.estado_ciclo === 'ativo' ? 'em_saida' : 'ativo')
  const [motivo, setMotivo] = useState('')
  const remanescentes = itensDeObrigacao(tarefas, [cliente]).filter((i) => i.clienteId === cliente.id && !['entregue', 'cancelada', 'dispensada'].includes(i.status))
  const bloqueio = estado === 'encerrado' && remanescentes.length ? `Encerrar só sem obrigações remanescentes: ainda há ${remanescentes.length} (${remanescentes.slice(0, 3).map((i) => i.nome).join(', ')}${remanescentes.length > 3 ? '…' : ''}).` : estado === cliente.estado_ciclo ? 'É o estado atual.' : null
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Mudar estado · ${cliente.nome}`}
      descricao={`Hoje: ${rotuloEstado[cliente.estado_ciclo]} desde ${ddmm(cliente.estado_ciclo_desde)}. Vai em cartão; em implantação e em saída abrem as trilhas (S04).`}
      acao="Preparar o cartão"
      acaoDesabilitada={!!bloqueio || motivo.trim().length < 4}
      onAcao={() => {
        trabalhar({
          setor: 'societario',
          titulo: 'Mudar estado do ciclo',
          cliente: cliente.nome,
          clienteId: cliente.id,
          atividade: 'CIC-001',
          etapas: ['Conferindo bloqueios (obrigações, contrato, acessos)', `Preparando a mudança para “${rotuloEstado[estado]}”`],
          seg: 0.8,
          texto: `Preparei a mudança de ${cliente.nome} para “${rotuloEstado[estado]}”. Sem bloqueios. Aprove para valer.`,
          cartao: { acao: { tipo: 'cliente.mudar_estado', clienteId: cliente.id, estado, motivo }, resumo: `Mudar para “${rotuloEstado[estado]}”`, argumentos: [['De', rotuloEstado[cliente.estado_ciclo]], ['Para', rotuloEstado[estado]], ['Motivo', motivo]] },
        })
        onFechar()
      }}
    >
      <Campo rotulo="Novo estado">{(id) => <CampoEscolha id={id} valor={estado} onMudar={(v) => setEstado(v as EstadoCiclo)} opcoes={estadosOrdem.map((e) => ({ valor: e, rotulo: rotuloEstado[e] }))} />}</Campo>
      {bloqueio && <p className="bg-warning/10 rounded-[12px] px-3 py-2 text-sm">{bloqueio}</p>}
      <Campo rotulo="Motivo">{(id) => <CampoArea id={id} linhas={2} valor={motivo} onMudar={setMotivo} placeholder="Ex.: contrato assinado em 18/11" />}</Campo>
    </GavetaFormulario>
  )
}

registrarExecutor('cliente.mudar_estado', (acao, { loja, quem }) => {
  const id = String(acao.clienteId)
  const estado = acao.estado as EstadoCiclo
  try {
    repos.clientes.atualizar(id, { estado_ciclo: estado, estado_ciclo_desde: HOJE_DEMO }, { ferramenta: 'cliente.mudar_estado', texto: `${quem} mudou o estado para “${rotuloEstado[estado]}”: ${String(acao.motivo)}` })
    loja.toast(`Estado agora “${rotuloEstado[estado]}”.${estado === 'em_implantacao' || estado === 'em_saida' ? ' A trilha começou.' : ''}`)
  } catch (e) {
    loja.toastErro(erroTexto(e))
  }
})

/* ---------- S02-A35: fundir clientes (Administrador) ---------- */

export function GavetaFundir({ cliente, onFechar }: { cliente: Cliente; onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const confirmar = useConfirmar()
  const clientes = useTabela('cliente').filter((c) => c.id !== cliente.id && !c.arquivado_em && !c.fundido_em)
  const [outro, setOutro] = useState(clientes[0]?.id ?? '')
  const alvo = clientes.find((c) => c.id === outro)
  return (
    <GavetaFormulario
      aberta
      onFechar={onFechar}
      titulo={`Fundir com ${cliente.nome}`}
      descricao="O outro cadastro é o duplicado: conversas, tarefas, horas e documentos passam para este; o duplicado fica arquivado com “fundido em”."
      acao="Fundir"
      acaoDesabilitada={!alvo}
      onAcao={async () => {
        if (!alvo) return
        const ok = await confirmar({ titulo: `Fundir ${alvo.nome} em ${cliente.nome}?`, descricao: 'Não se desfaz pela tela: o histórico guarda “fundido em” e de onde veio cada registro.', acao: 'Fundir', perigo: true })
        if (!ok) return
        try {
          const tarefas = repos.tarefas.listar((t) => t.cliente_id === alvo.id)
          tarefas.forEach((t) => repos.tarefas.atualizar(t.id, { cliente_id: cliente.id, extras: { ...t.extras, veio_de: alvo.id } }, { ferramenta: 'cliente.fundir', texto: `Tarefa religada de ${alvo.nome} para ${cliente.nome}` }))
          const conversas = repos.conversas.listar((c) => c.cliente_id === alvo.id)
          conversas.forEach((c) => repos.conversas.atualizar(c.id, { cliente_id: cliente.id }, { ferramenta: 'cliente.fundir' }))
          loja.documentos.filter((d) => d.clienteId === alvo.id).forEach((d) => loja.ajustarDocumento(d.id, { clienteId: cliente.id }))
          repos.clientes.atualizar(alvo.id, { fundido_em: cliente.id, arquivado_em: new Date().toISOString() }, { ferramenta: 'cliente.fundir', texto: `${usuario.nome} fundiu ${alvo.nome} em ${cliente.nome}` })
          loja.toast(`${alvo.nome} fundido: ${tarefas.length} tarefas e ${conversas.length} conversas agora em ${cliente.nome}.`)
          onFechar()
        } catch (e) {
          loja.toastErro(erroTexto(e))
        }
      }}
    >
      <Campo rotulo="Cadastro duplicado">{(id) => <CampoEscolha id={id} valor={outro} onMudar={setOutro} opcoes={clientes.map((c) => ({ valor: c.id, rotulo: `${c.codigo} - ${c.nome}` }))} />}</Campo>
      {alvo && (
        <p className="text-muted-foreground text-sm">
          {repos.tarefas.listar((t) => t.cliente_id === alvo.id).length} tarefas e {repos.conversas.listar((c) => c.cliente_id === alvo.id).length} conversas vão para {cliente.nome}.
        </p>
      )}
    </GavetaFormulario>
  )
}

/* ---------- S02-A33: abrir comunicação do Domicílio Judicial (conta como ciência) ---------- */

export function useAbrirComunicacao() {
  const confirmar = useConfirmar()
  const loja = useLoja()
  const { usuario } = useSessao()
  return async (c: { id: string; tipo: string; tribunal: string; processo: string }, onAberta: () => void) => {
    const ok = await confirmar({ titulo: `Abrir a ${c.tipo}?`, descricao: `Abrir o teor no Domicílio Judicial conta como ciência a partir de agora, em nome do escritório. ${c.tribunal} · ${c.processo}. Sem abrir, a ciência tácita corre no prazo da lista.`, acao: 'Abrir e dar ciência', perigo: true })
    if (!ok) return
    onAberta()
    registrar(`${usuario.nome} abriu a ${c.tipo} ${c.processo} no Domicílio Judicial (ciência dada)`, 'comunicacao.abrir')
    loja.toast(`Ciência dada em ${new Date().toLocaleDateString('pt-BR')}. O prazo começa a contar.`)
  }
}

/* ---------- Gatilho: certificado a 30 dias (SOC-009) ---------- */

/** O integrante acorda quando um certificado entra nos 30 dias e pede a renovação pelo app (uma vez). */
export function useGatilhoCertificados(clienteId?: string) {
  const trabalhar = useAgenteS02()
  const tela = useTabela('registro_tela')
  useEffect(() => {
    const lista = colCredenciais.listar().filter((c) => (!clienteId || c.cliente_id === clienteId) && c.situacao === 'valido' && !c.sem_arquivo && (Date.parse(c.validade) - Date.parse(HOJE_DEMO)) / 86_400_000 <= 30)
    const ja = (tela.find((r) => r.id === 's02:gatilho-certificado')?.valor as string[] | undefined) ?? []
    const novos = lista.filter((c) => !ja.includes(c.id) && c.cliente_id !== 'c1')
    if (!novos.length) return
    repos.telas.lembrar('s02:gatilho-certificado', [...ja, ...novos.map((c) => c.id)])
    for (const c of novos) {
      const nome = banco.ler('cliente').find((x) => x.id === c.cliente_id)?.nome ?? ''
      trabalhar({
        setor: 'societario',
        titulo: 'Pedir a renovação do certificado',
        cliente: nome,
        clienteId: c.cliente_id,
        atividade: 'SOC-009',
        inicio: `Gatilho certificado.vencer_em_30_dias: o ${c.tipo} de ${nome} vence em ${ddmm(c.validade)}. Vou pedir a renovação pelo app.`,
        etapas: ['Explicando o motivo em linguagem simples', 'Publicando a pendência com o termo no app', 'Ligando a régua até chegar'],
        seg: 0.8,
        texto: `Pedi a renovação do ${c.tipo} de ${nome} pelo app (vence em ${ddmm(c.validade)}). O arquivo vai direto ao cofre; aviso quando chegar.`,
        aviso: `Renovação do certificado pedida · ${nome}`,
        toast: false,
        aoTerminar: () => colCredenciais.atualizar(c.id, { situacao: 'pedido_ao_cliente' }, { texto: `Societário pediu a renovação do ${c.tipo} de ${nome} (gatilho dos 30 dias)` }),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId])
}


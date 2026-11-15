import { BellIcon, BuildingsIcon, CaretRightIcon, CertificateIcon, CheckCircleIcon, DeviceMobileIcon, FingerprintIcon, KeyIcon, ReceiptIcon, ScrollIcon, ShieldCheckIcon, SignOutIcon, UsersIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { fichas } from '@/ambiente/clientes'
import { useLoja } from '@/ambiente/loja'
import { EstadoErro, SeloDemonstracao, useConfirmar } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { societarioDe } from '@/dados/painel-abas'
import { useTabela } from '@/nucleo/react'
import { cn } from '@/lib/utils'
import { ator, idDoUsuario, type Ctx } from './contexto'
import { agoraTexto, HOJE, itensPorCodigo, procuracoesPadrao, tiposPedido } from './dados'
import { historicoEntradas, rotuloCategoria, useAcesso, useAssinaturas, useConvites, useEmpresaApp, useLinks, usePreferencias, useRecibos, useSessoes, type CanalAviso, type CategoriaAviso, type Recibo } from './estado'
import { useAbrirPedido } from './pedidos'
import { FolhaRecibo, usePendencias } from './pendencias'
import { AreaTexto, Bloco, Campo, Escolha, Faixa, Folha, Linha, Selo, TituloTela } from './pecas'
import { registrarPush, validarCertificado } from './simulados'

/**
 * S10-T09 · Empresa (06, 3.9; 2.5; 6; 12.4; 10). Tudo só leitura: mudar dado
 * da empresa vira pedido. Pessoas (saída vira GES-041, convites com reenviar,
 * revisão anual), certificado A1 (termo, uso, revogação, envio ao cofre),
 * procurações, termos e recibos, acessos e preferências de aviso.
 */

const secoes = [
  { id: 'dados', titulo: 'Dados da empresa', icone: BuildingsIcon, socio: false },
  { id: 'pessoas', titulo: 'Pessoas e papéis', icone: UsersIcon, socio: false },
  { id: 'certificado', titulo: 'Certificado digital', icone: CertificateIcon, socio: true },
  { id: 'procuracoes', titulo: 'Procurações', icone: ShieldCheckIcon, socio: false },
  { id: 'termos', titulo: 'Termos e recibos', icone: ScrollIcon, socio: false },
  { id: 'acessos', titulo: 'Acessos e aparelhos', icone: DeviceMobileIcon, socio: false },
  { id: 'avisos', titulo: 'Preferências de aviso', icone: BellIcon, socio: false },
] as const

export function Empresa({ ctx }: { ctx: Ctx }) {
  const secao = ctx.item
  const visiveis = secoes.filter((s) => !s.socio || ctx.areas.includes('societario'))
  const voltar = () => ctx.ir('empresa')
  if (secao === 'dados') return <Dados ctx={ctx} voltar={voltar} />
  if (secao === 'pessoas') return <Pessoas ctx={ctx} voltar={voltar} />
  if (secao === 'certificado' && ctx.areas.includes('societario')) return <Certificado ctx={ctx} voltar={voltar} />
  if (secao === 'procuracoes') return <Procuracoes ctx={ctx} voltar={voltar} />
  if (secao === 'termos') return <Termos ctx={ctx} voltar={voltar} />
  if (secao === 'acessos') return <Acessos ctx={ctx} voltar={voltar} />
  if (secao === 'avisos') return <PreferenciasAviso ctx={ctx} voltar={voltar} />
  return (
    <div className="flex flex-col gap-2">
      <TituloTela voltar={() => ctx.ir('mais')}>Empresa</TituloTela>
      <RevisaoAnual ctx={ctx} />
      {visiveis.map((s) => (
        <button key={s.id} type="button" onClick={() => ctx.ir('empresa', s.id)} className="bg-surface shadow-cartao flex cursor-pointer items-center gap-3 rounded-lg px-3.5 py-3 text-left text-sm">
          <s.icone className="size-5" /> <span className="flex-1">{s.titulo}</span>
          <CaretRightIcon className="text-muted-foreground size-4" />
        </button>
      ))}
    </div>
  )
}

function Dados({ ctx, voltar }: { ctx: Ctx; voltar: () => void }) {
  const loja = useLoja()
  const [extras] = useEmpresaApp(ctx.clienteId)
  const cliente = loja.clientes.find((c) => c.id === ctx.clienteId)
  const perfil = useTabela('versao_perfil').find((v) => v.cliente_id === ctx.clienteId)
  const [pedir, setPedir] = useState(false)
  const abrir = useAbrirPedido(ctx)
  const def = tiposPedido.find((t) => t.codigo === 'SOC-002')!
  const [oque, setOque] = useState('')
  const [detalhe, setDetalhe] = useState('')
  const linhas: [string, string][] = [
    ['Razão social', cliente?.nome ?? ctx.clienteNome],
    ['CNPJ / CPF', cliente?.documento ?? '—'],
    ['Regime', cliente?.regime ?? '—'],
    ['Situação', cliente?.situacao === 'implantacao' ? 'em implantação' : cliente?.situacao === 'saida' ? 'em saída' : 'ativa'],
    ['UF', perfil?.uf ?? '—'],
    ['Serviços contratados', (perfil?.servicos_contratados ?? ['contabil']).map((x) => (x === 'contabil' ? 'contabilidade' : x === 'bpo' ? 'BPO financeiro' : x)).join(', ')],
    ['Perfil vigente desde', perfil?.vigente_de?.split('-').reverse().join('/') ?? '—'],
  ]
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>Dados da empresa</TituloTela>
      <Bloco titulo="Perfil vigente" acao={<Selo>só leitura</Selo>}>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          {linhas.map(([r, v]) => (
            <div key={r} className="contents">
              <dt className="text-muted-foreground">{r}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="text-muted-foreground text-xs">Mudou algo? Peça a alteração: o Societário confere os documentos e os custos antes.</p>
        {!ctx.leitura && ctx.ehSocio && (
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => setPedir(true)}>
            Pedir alteração
          </Button>
        )}
      </Bloco>
      {extras.alteracoes.length > 0 && (
        <Bloco titulo="Alterações pedidas">
          {extras.alteracoes.map((a) => (
            <Linha key={a.em} titulo={a.oque} apoio={`pedido em ${a.em}`} onClick={a.tarefaId ? () => ctx.ir('pedidos', a.tarefaId!) : undefined} direita={<CaretRightIcon className="text-muted-foreground size-4" />} />
          ))}
        </Bloco>
      )}
      {pedir && (
        <Folha
          titulo="Pedir alteração"
          onFechar={() => setPedir(false)}
          rodape={
            <Button
              className="rounded-full"
              disabled={!oque || detalhe.trim().length < 3}
              onClick={() => {
                const id = abrir(def, { oque, detalhe: detalhe.trim() })
                setPedir(false)
                ctx.ir('pedidos', id)
              }}
            >
              Abrir pedido (SOC-002)
            </Button>
          }
        >
          <Escolha rotulo="O que muda" valor={oque} onMudar={setOque} opcoes={def.campos[0].opcoes ?? []} />
          <AreaTexto rotulo="Detalhes" valor={detalhe} onMudar={setDetalhe} placeholder="Ex.: endereço novo a partir de 01/12" />
          <p className="text-muted-foreground text-xs">Alteração contratual costuma ficar fora do contrato: aparece como serviço avulso para você autorizar.</p>
        </Folha>
      )}
    </div>
  )
}

function Pessoas({ ctx, voltar }: { ctx: Ctx; voltar: () => void }) {
  const loja = useLoja()
  const [extras, setExtras] = useEmpresaApp(ctx.clienteId)
  const [convites, setConvites] = useConvites()
  const confirmar = useConfirmar()
  const [pedirConvite, setPedirConvite] = useState(false)
  const [nome, setNome] = useState('')
  const [papel, setPapel] = useState('')
  const [contato, setContato] = useState('')
  const contatos = loja.fichaDe(ctx.clienteId)?.contatos ?? fichas[ctx.clienteId]?.contatos ?? []
  const pendentes = convites.filter((c) => c.clienteId === ctx.clienteId && (c.situacao === 'pendente' || c.situacao === 'expirado'))
  const saiu = async (n: string) => {
    const ok = await confirmar({ titulo: `${n} saiu da empresa?`, descricao: 'O escritório recebe o pedido e revoga o acesso dessa pessoa ao app (GES-041). Os registros de entrega ficam.', acao: 'Avisar o escritório' })
    if (!ok) return
    const id = loja.criarTarefa({ codigo: 'GES-041', titulo: `Revogar acesso de ${n} (saiu da empresa)`, cliente: ctx.clienteNome, setor: 'gestao_atendimento', prazo: '19/11', status: 'a_fazer', origem: 'pedido_cliente', responsavel: { tipo: 'pessoa', nome: 'Bruno Costa' } })
    setExtras((e) => ({ ...e, saidas: { ...e.saidas, [n]: { em: agoraTexto(), tarefaId: id } } }))
    loja.avisar({ para: [idDoUsuario('Bruno Costa') ?? 'u4'], tipo: 'cliente', setor: 'gestao_atendimento', titulo: `${ctx.clienteNome}: ${n} saiu da empresa`, detalhe: `${ctx.contato.nome} pediu a revogação do acesso`, destino: { modulo: 'painel', tarefa: id } })
    loja.registrar(ator(ctx), `Avisou que ${n} saiu da empresa; pediu a revogação do acesso (GES-041) · ${ctx.clienteNome}`)
    ctx.avisarApp('Pedido enviado. O escritório revoga o acesso e confirma.')
  }
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>Pessoas e papéis</TituloTela>
      <Bloco titulo="Quem tem contato com o escritório">
        {contatos.map((c) => {
          const s = extras.saidas[c.nome]
          return (
            <div key={c.nome} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block">
                  {c.nome}
                  {c.nome === ctx.contato.nome && <span className="text-muted-foreground text-xs"> (você)</span>}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {c.papel}
                  {c.app ? ' · usa o app' : ' · sem app'}
                  {c.alcadaPagamento ? ` · aprova pagamentos até ${c.alcadaPagamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}` : ''}
                </span>
              </span>
              {s ? <Selo tom="atencao">saída avisada</Selo> : ctx.ehSocio && c.nome !== ctx.contato.nome && !ctx.leitura ? (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void saiu(c.nome)}>
                  Esta pessoa saiu
                </Button>
              ) : null}
            </div>
          )
        })}
        <p className="text-muted-foreground text-[11px]">O papel e as áreas de cada pessoa são definidos pelo escritório, por serviço contratado. Para mudar, peça na conversa.</p>
      </Bloco>
      {(pendentes.length > 0 || ctx.ehSocio) && (
        <Bloco titulo="Convites pendentes">
          {pendentes.length === 0 && <p className="text-muted-foreground text-sm">Nenhum convite esperando.</p>}
          {pendentes.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block">
                  {c.nome} <span className="text-muted-foreground text-xs">· {c.papel}</span>
                </span>
                <span className="text-muted-foreground block text-xs">
                  {c.situacao === 'expirado' ? `venceu em ${c.expiraEm}` : `vale até ${c.expiraEm}`} · {c.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}
                  {c.reenvios ? ` · reenviado ${c.reenvios}×` : ''}
                </span>
              </span>
              {ctx.ehSocio && !ctx.leitura && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setConvites((l) => l.map((x) => (x.id === c.id ? { ...x, situacao: 'pendente', enviadoEm: HOJE, expiraEm: '25/11/2026', reenvios: x.reenvios + 1 } : x)))
                    loja.registrar(ator(ctx), `Reenviou o convite do app para ${c.nome} (${ctx.clienteNome})`)
                    ctx.avisarApp(`Convite reenviado para ${c.nome}; vale mais 7 dias.`)
                  }}
                >
                  Reenviar
                </Button>
              )}
            </div>
          ))}
          {ctx.ehSocio && !ctx.leitura && (
            <Button size="sm" variant="ghost" className="w-fit rounded-full" onClick={() => setPedirConvite(true)}>
              Pedir convite para outra pessoa
            </Button>
          )}
        </Bloco>
      )}
      {pedirConvite && (
        <Folha
          titulo="Pedir convite"
          onFechar={() => setPedirConvite(false)}
          rodape={
            <Button
              className="rounded-full"
              disabled={nome.trim().length < 3 || !papel || contato.trim().length < 6}
              onClick={() => {
                const id = loja.criarTarefa({ codigo: 'GES-104', titulo: `Convidar ${nome.trim()} (${papel}) para o app`, cliente: ctx.clienteNome, setor: 'gestao_atendimento', prazo: '19/11', status: 'a_fazer', origem: 'pedido_cliente', responsavel: { tipo: 'pessoa', nome: 'Bruno Costa' } })
                loja.avisar({ para: [idDoUsuario('Bruno Costa') ?? 'u4'], tipo: 'cliente', setor: 'gestao_atendimento', titulo: `${ctx.clienteNome} pediu convite do app para ${nome.trim()}`, detalhe: `${papel} · ${contato.trim()} · confira na ficha antes de convidar`, destino: { modulo: 'painel', tarefa: id } })
                loja.registrar(ator(ctx), `Pediu convite do app para ${nome.trim()} (${papel}) · ${ctx.clienteNome}`)
                ctx.avisarApp('Pedido enviado. O escritório cadastra o contato na ficha e manda o convite.')
                setPedirConvite(false)
                setNome('')
                setPapel('')
                setContato('')
              }}
            >
              Pedir ao escritório
            </Button>
          }
        >
          <p className="text-muted-foreground text-xs">O acesso é dado pelo escritório (a conta é dele): ele cadastra o contato na ficha e manda o link de 7 dias.</p>
          <Campo rotulo="Nome" valor={nome} onMudar={setNome} />
          <Escolha rotulo="Papel" valor={papel} onMudar={setPapel} opcoes={['sócio', 'financeiro', 'RH', 'fiscal da empresa']} />
          <Campo rotulo="WhatsApp ou e-mail" valor={contato} onMudar={setContato} />
        </Folha>
      )}
    </div>
  )
}

/** Revisão anual (06, 2.5): "estas pessoas ainda trabalham com vocês?" ao sócio, com botões por pessoa. */
function RevisaoAnual({ ctx }: { ctx: Ctx }) {
  const loja = useLoja()
  const [extras, setExtras] = useEmpresaApp(ctx.clienteId)
  const [respostas, setRespostas] = useState<Record<string, 'sim' | 'saiu'>>({})
  const contatos = (loja.fichaDe(ctx.clienteId)?.contatos ?? []).filter((c) => c.nome !== ctx.contato.nome && c.app)
  if (!ctx.ehSocio || ctx.leitura || extras.revisao || contatos.length === 0) return null
  const todas = contatos.every((c) => respostas[c.nome])
  return (
    <Bloco titulo="Revisão anual de acessos" acao={<Selo tom="atencao">1 minuto</Selo>}>
      <p className="text-sm">Estas pessoas ainda trabalham com vocês?</p>
      {contatos.map((c) => (
        <div key={c.nome} className="flex items-center gap-2 text-sm">
          <span className="min-w-0 flex-1">
            {c.nome} <span className="text-muted-foreground text-xs">· {c.papel}</span>
          </span>
          {(['sim', 'saiu'] as const).map((r) => (
            <Button key={r} size="sm" variant={respostas[c.nome] === r ? 'default' : 'outline'} className="rounded-full" onClick={() => setRespostas((x) => ({ ...x, [c.nome]: r }))}>
              {r === 'sim' ? 'Sim' : 'Saiu'}
            </Button>
          ))}
        </div>
      ))}
      <Button
        size="sm"
        className="w-fit rounded-full"
        disabled={!todas}
        onClick={() => {
          const saidas = Object.entries(respostas).filter(([, r]) => r === 'saiu').map(([n]) => n)
          const novasSaidas: Record<string, { em: string; tarefaId?: string }> = {}
          for (const n of saidas) {
            const id = loja.criarTarefa({ codigo: 'GES-041', titulo: `Revogar acesso de ${n} (revisão anual)`, cliente: ctx.clienteNome, setor: 'gestao_atendimento', prazo: '19/11', status: 'a_fazer', origem: 'pedido_cliente', responsavel: { tipo: 'pessoa', nome: 'Bruno Costa' } })
            novasSaidas[n] = { em: agoraTexto(), tarefaId: id }
          }
          setExtras((e) => ({ ...e, revisao: { em: agoraTexto(), respostas }, saidas: { ...e.saidas, ...novasSaidas } }))
          loja.registrar(ator(ctx), `Respondeu a revisão anual de acessos: ${saidas.length ? `${saidas.join(', ')} saíram` : 'todos continuam'} · ${ctx.clienteNome}`)
          ctx.avisarApp(saidas.length ? 'Obrigado. O escritório revoga os acessos de quem saiu.' : 'Obrigado. Tudo certo com os acessos.')
        }}
      >
        Confirmar
      </Button>
    </Bloco>
  )
}

function Certificado({ ctx, voltar }: { ctx: Ctx; voltar: () => void }) {
  const loja = useLoja()
  const [extras, setExtras] = useEmpresaApp(ctx.clienteId)
  const confirmar = useConfirmar()
  const cert = societarioDe(ctx.clienteId).certificados[0]
  const c = extras.cert
  const [termo, setTermo] = useState(false)
  const [novo, setNovo] = useState(false)
  const rotulos: Record<keyof typeof c.servicos, string> = { captura: 'captura de notas', consultas: 'consultas em portais', fornecedores: 'consultas por fornecedor (DTE)', transmissao: 'transmissão de declarações' }
  const autorizados = (Object.keys(c.servicos) as (keyof typeof c.servicos)[]).filter((k) => c.servicos[k])
  const revogar = async () => {
    const ok = await confirmar({ titulo: 'Revogar o certificado?', descricao: 'O escritório para de usar o certificado na hora e recebe um aviso urgente. A captura de notas que depende dele para.', acao: 'Revogar', perigo: true })
    if (!ok) return
    setExtras((e) => ({ ...e, cert: { ...e.cert, revogado: agoraTexto() } }))
    loja.avisar({ para: [idDoUsuario(fichas[ctx.clienteId]?.responsaveis.societario) ?? 'u4'], tipo: 'cliente', setor: 'societario', titulo: `${ctx.clienteNome} revogou o certificado A1 pelo app`, detalhe: `${ctx.contato.nome} · a captura que depende dele parou`, destino: { modulo: 'painel', aba: 'societario', cliente: ctx.clienteId } })
    loja.registrar(ator(ctx), `Revogou o certificado A1 (${ctx.clienteNome})`)
    ctx.avisarApp('Certificado revogado. O escritório foi avisado.')
  }
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>Certificado digital</TituloTela>
      {c.enviadoNovo && (
        <Faixa tom="ok" icone={<CheckCircleIcon weight="fill" />}>
          Certificado novo no cofre desde {c.enviadoNovo.em}: o CNPJ confere e vale até {c.enviadoNovo.validade}.
        </Faixa>
      )}
      <Bloco titulo={cert ? cert.tipo : 'Sem certificado'} acao={c.revogado ? <Selo tom="erro">revogado</Selo> : cert ? <Selo tom={cert.dias < 15 && !c.enviadoNovo ? 'atencao' : 'ok'}>{c.enviadoNovo ? 'ativo (novo)' : `vence em ${cert.dias} dias`}</Selo> : undefined}>
        {cert && (
          <>
            <p className="text-sm">
              Titular: {ctx.clienteNome} · validade {c.enviadoNovo?.validade ?? cert.validade}
            </p>
            <p className="text-muted-foreground text-xs">O app nunca mostra nem baixa o arquivo; ele e a senha ficam só no cofre.</p>
            <p className="text-sm">
              Usado <strong className="font-medium">14 vezes em novembro</strong>: captura de notas 12, situação fiscal 2 (pelo escritório e automático).
            </p>
          </>
        )}
        <p className="text-sm">
          Autorizado para: {autorizados.map((k) => rotulos[k]).join(', ')} <span className="text-muted-foreground text-xs">(termo v{c.termoVersao})</span>
        </p>
        {!ctx.leitura && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="rounded-full" onClick={() => setNovo(true)}>
              <ShieldCheckIcon /> Enviar certificado novo
            </Button>
            {!c.revogado && (
              <>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setTermo(true)}>
                  Alterar o termo
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => void revogar()}>
                  Revogar
                </Button>
              </>
            )}
          </div>
        )}
      </Bloco>
      <Bloco titulo="Versões do termo">
        {c.versoes.map((v) => (
          <Linha key={v.versao} titulo={`v${v.versao} · ${v.em}`} apoio={v.servicos} />
        ))}
      </Bloco>
      {termo && (
        <FolhaTermo
          atual={c.servicos}
          rotulos={rotulos}
          onFechar={() => setTermo(false)}
          onSalvar={(s) => {
            const versao = c.termoVersao + 1
            setExtras((e) => ({ ...e, cert: { ...e.cert, servicos: s, termoVersao: versao, versoes: [{ versao, em: agoraTexto(), servicos: (Object.keys(s) as (keyof typeof s)[]).filter((k) => s[k]).map((k) => rotulos[k]).join(', ') }, ...e.cert.versoes] } }))
            loja.registrar(ator(ctx), `Alterou o termo do certificado (v${versao}) · ${ctx.clienteNome}`)
            ctx.avisarApp(`Termo v${versao} registrado. O escritório já usa as novas regras.`)
            setTermo(false)
          }}
        />
      )}
      {novo && (
        <FolhaEnvioCertificado
          ctx={ctx}
          onFechar={() => setNovo(false)}
          onOk={(validade) => {
            setExtras((e) => ({ ...e, cert: { ...e.cert, revogado: undefined, enviadoNovo: { em: agoraTexto(), validade } } }))
            const t = loja.tarefas.find((x) => x.cliente === ctx.clienteNome && /certificado/i.test(x.titulo) && x.status !== 'concluida' && x.status !== 'cancelada')
            if (t) loja.atualizarTarefa(t.id, { status: 'concluida' })
            loja.avisar({ para: [idDoUsuario(fichas[ctx.clienteId]?.responsaveis.societario) ?? 'u4'], tipo: 'cliente', setor: 'societario', titulo: `${ctx.clienteNome} enviou o certificado novo`, detalhe: 'validado no cofre: CNPJ confere, cadeia ICP-Brasil ok', destino: t ? { modulo: 'painel', tarefa: t.id } : { modulo: 'painel', aba: 'societario' } })
            loja.registrar(ator(ctx), `Enviou o certificado novo ao cofre (${ctx.clienteNome})`)
          }}
        />
      )}
    </div>
  )
}

function FolhaTermo<T extends Record<string, boolean>>({ atual, rotulos, onFechar, onSalvar }: { atual: T; rotulos: Record<keyof T, string>; onFechar: () => void; onSalvar: (s: T) => void }) {
  const [s, setS] = useState<T>(atual)
  return (
    <Folha
      titulo="Termo de uso do certificado"
      onFechar={onFechar}
      rodape={
        <Button className="rounded-full" onClick={() => onSalvar(s)}>
          Concordo com esta versão
        </Button>
      }
    >
      <p className="text-sm">Autorizo o escritório a usar o certificado para:</p>
      {(Object.keys(s) as (keyof T)[]).map((k) => (
        <label key={String(k)} className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={s[k]} onChange={(e) => setS((x) => ({ ...x, [k]: e.target.checked }))} className="accent-primary size-4" /> {rotulos[k]}
        </label>
      ))}
      <p className="text-muted-foreground text-xs">Até o vencimento do certificado. Você revoga quando quiser. Mudar o termo gera uma versão nova, registrada com data.</p>
    </Folha>
  )
}

function FolhaEnvioCertificado({ ctx, onFechar, onOk }: { ctx: Ctx; onFechar: () => void; onOk: (validade: string) => void }) {
  const [passo, setPasso] = useState<'motivo' | 'arquivo' | 'pronto'>('motivo')
  const [arquivo, setArquivo] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [res, setRes] = useState<{ validade: string; fonte: string } | null>(null)
  const loja = useLoja()
  const cnpj = loja.clientes.find((c) => c.id === ctx.clienteId)?.documento ?? ''
  const enviar = () => {
    setCarregando(true)
    setErro(null)
    validarCertificado(arquivo, senha, cnpj)
      .then((r) => {
        if (!r.dados.ok) return setErro(r.dados.erro)
        setRes({ validade: r.dados.validade, fonte: r.fonte })
        setPasso('pronto')
        onOk(r.dados.validade)
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setCarregando(false))
  }
  return (
    <Folha titulo="Enviar certificado A1" onFechar={onFechar}>
      {passo === 'motivo' && (
        <>
          <p className="text-sm">Precisamos dele para receber as notas que seus fornecedores emitem contra você: em SP não há outro caminho. Também serve para as consultas nos portais.</p>
          <p className="text-muted-foreground text-xs">Você escolhe para que o escritório pode usar (termo), e o arquivo e a senha vão direto para o cofre: ninguém vê a senha.</p>
          <Button className="rounded-full" onClick={() => setPasso('arquivo')}>
            Concordo com o termo e continuar
          </Button>
        </>
      )}
      {passo === 'arquivo' && (
        <>
          <p className="text-muted-foreground text-xs">Escolha o arquivo .pfx ou .p12 (na demonstração, um destes):</p>
          {['certificado-a1-2027.pfx', 'certificado-de-outra-empresa.pfx', 'certificado-vence-em-3-dias.pfx'].map((a) => (
            <button key={a} type="button" aria-pressed={arquivo === a} onClick={() => setArquivo(a)} className={cn('flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm', arquivo === a ? 'bg-raised shadow-contorno' : 'bg-sunken')}>
              <KeyIcon className="size-4" /> {a}
            </button>
          ))}
          <Campo rotulo="Senha do certificado" tipo="password" valor={senha} onMudar={setSenha} ajuda='Na demonstração, a senha "errada" simula senha incorreta.' />
          {erro && (
            <Faixa tom="erro" icone={<WarningCircleIcon weight="fill" />}>
              {erro}
            </Faixa>
          )}
          <Button className="rounded-full" disabled={!arquivo || senha.length < 4 || carregando} onClick={enviar}>
            {carregando ? 'Validando no cofre…' : 'Enviar ao cofre'}
          </Button>
        </>
      )}
      {passo === 'pronto' && res && (
        <>
          <p className="flex items-center gap-2 text-sm">
            <CheckCircleIcon className="text-success size-4" weight="fill" /> Validado: a senha abre o arquivo, o CNPJ confere e vale até {res.validade}. Cadeia ICP-Brasil ok.
          </p>
          <SeloDemonstracao fonte={res.fonte} />
          <Button variant="outline" className="rounded-full" onClick={onFechar}>
            Pronto
          </Button>
        </>
      )}
      {erro && passo !== 'arquivo' && <EstadoErro descricao={erro} onTentar={enviar} />}
    </Folha>
  )
}

function Procuracoes({ ctx, voltar }: { ctx: Ctx; voltar: () => void }) {
  const lista = procuracoesPadrao(ctx.clienteId)
  const pend = usePendencias(ctx)
  const [passos, setPassos] = useState<string | null>(null)
  const def = itensPorCodigo['SOC-011']
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>Procurações</TituloTela>
      <p className="text-muted-foreground text-xs">O que o escritório pode fazer por você em cada órgão, com a validade. Serve também para revogar tudo se um dia vocês saírem.</p>
      {lista.map((p) => (
        <Bloco
          key={p.orgao}
          titulo={p.orgao}
          acao={<Selo tom={p.situacao === 'ativa' ? 'ok' : p.situacao === 'vence_em_breve' ? 'atencao' : p.situacao === 'vencida' ? 'erro' : 'neutro'}>{p.situacao === 'vence_em_breve' ? 'vence em breve' : p.situacao}</Selo>}
        >
          <p className="text-sm">{p.oQue}</p>
          <p className="text-muted-foreground text-xs">
            Validade: {p.validade} · conferida {p.conferidaPor === 'automático' ? 'automaticamente no órgão' : 'pelo escritório'}
          </p>
          {p.situacao === 'pendente' && !ctx.leitura && (
            <Button
              size="sm"
              variant="outline"
              className="w-fit rounded-full"
              onClick={() => {
                const t = pend.find((x) => x.codigo === 'SOC-011' || x.codigo === 'NFE-502')
                if (t) ctx.ir('pendencias', t.id)
                else setPassos(p.orgao)
              }}
            >
              Fazer agora
            </Button>
          )}
        </Bloco>
      ))}
      {passos && (
        <Folha titulo={passos} onFechar={() => setPassos(null)}>
          <ol className="flex flex-col gap-2 text-sm">
            {def.passos?.map((x, i) => (
              <li key={x} className="flex gap-2">
                <span className="bg-sunken flex size-6 shrink-0 items-center justify-center rounded-full text-xs">{i + 1}</span>
                {x}
              </li>
            ))}
          </ol>
        </Folha>
      )}
    </div>
  )
}

function Termos({ ctx, voltar }: { ctx: Ctx; voltar: () => void }) {
  const [extras] = useEmpresaApp(ctx.clienteId)
  const [acesso] = useAcesso(ctx.pessoa)
  const [recibos] = useRecibos(ctx.clienteId)
  const [assin] = useAssinaturas(ctx.clienteId)
  const [recibo, setRecibo] = useState<Recibo | null>(null)
  const termos = [...extras.termos.map((t) => (t.titulo === 'Termo de uso do app' && acesso.termo ? { ...t, versao: acesso.termo.versao.split(' ')[0], em: acesso.termo.em } : t)), ...extras.cert.versoes.slice(0, -1).map((v) => ({ titulo: 'Autorização de uso do certificado A1', versao: `v${v.versao}`, em: v.em }))]
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>Termos e recibos</TituloTela>
      <Bloco titulo="Termos aceitos">
        {termos.map((t) => (
          <Linha key={t.titulo + t.versao} icone={<ScrollIcon />} titulo={t.titulo} apoio={`versão ${t.versao} · aceito em ${t.em}`} />
        ))}
      </Bloco>
      <Bloco titulo="Assinaturas e ciências">
        {assin.filter((a) => a.situacao === 'assinado').length === 0 && <p className="text-muted-foreground text-sm">Nada assinado ainda.</p>}
        {assin
          .filter((a) => a.situacao === 'assinado')
          .map((a) => (
            <Linha key={a.id} icone={<FingerprintIcon />} titulo={a.titulo} apoio={`${a.assinadoPor} · ${a.assinadoEm} · hash ${a.hash?.slice(0, 10)}`} onClick={() => ctx.ir('assinaturas', a.id)} />
          ))}
      </Bloco>
      <Bloco titulo="Recibos de envio">
        {recibos.length === 0 && <p className="text-muted-foreground text-sm">Quando você mandar algo pelo app, o recibo aparece aqui.</p>}
        {recibos.map((r) => (
          <Linha key={r.protocolo} icone={<ReceiptIcon />} titulo={r.item} apoio={`protocolo ${r.protocolo} · ${r.quando}`} onClick={() => setRecibo(r)} direita={<CaretRightIcon className="text-muted-foreground size-4" />} />
        ))}
      </Bloco>
      {recibo && <FolhaRecibo r={recibo} onFechar={() => setRecibo(null)} />}
    </div>
  )
}

function Acessos({ ctx, voltar }: { ctx: Ctx; voltar: () => void }) {
  const loja = useLoja()
  const [sessoes, setSessoes] = useSessoes(ctx.pessoa)
  const [acesso, setAcesso] = useAcesso(ctx.pessoa)
  const [links] = useLinks(ctx.clienteId)
  const confirmar = useConfirmar()
  const [senha, setSenha] = useState<'nova' | null>(null)
  const [valor, setValor] = useState('')
  const sair = (id: string) => {
    setSessoes((l) => l.filter((s) => s.id !== id))
    loja.registrar(ator(ctx), `Encerrou uma sessão do app em outro aparelho`)
    ctx.avisarApp('Sessão encerrada naquele aparelho.')
  }
  const sairTodos = async () => {
    const ok = await confirmar({ titulo: 'Sair de todos os outros aparelhos?', descricao: 'Este aparelho continua dentro; os outros pedem o código de novo.', acao: 'Sair de todos' })
    if (!ok) return
    setSessoes((l) => l.filter((s) => s.atual))
    loja.registrar(ator(ctx), 'Saiu de todos os outros aparelhos')
    ctx.avisarApp('Pronto: só este aparelho continua dentro.')
  }
  const acessosLinks = links.flatMap((l) => l.acessos.map((a) => ({ ...a, nome: l.nomes[0], para: l.para })))
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>Acessos e aparelhos</TituloTela>
      <Bloco titulo="Sessões">
        {sessoes.map((s) => (
          <div key={s.id} className="flex items-center gap-2 text-sm">
            <DeviceMobileIcon className="text-muted-foreground size-5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block">{s.aparelho}</span>
              <span className="text-muted-foreground block text-xs">
                {s.local} · {s.atual ? 'em uso agora' : `último uso ${s.ultimo}`}
              </span>
            </span>
            {s.atual ? <Selo tom="ok">este</Selo> : (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => sair(s.id)}>
                Sair
              </Button>
            )}
          </div>
        ))}
        {sessoes.length > 1 && (
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={() => void sairTodos()}>
            <SignOutIcon /> Sair de todos os outros aparelhos
          </Button>
        )}
        <p className="text-muted-foreground text-[11px]">A sessão dura 90 dias e renova a cada uso; não sai sozinha por inatividade.</p>
      </Bloco>
      <Bloco titulo="Formas de entrar">
        <Linha icone={<KeyIcon />} titulo="Código por WhatsApp ou e-mail" apoio="sempre disponível" direita={<Selo tom="ok">ativo</Selo>} />
        <Linha
          icone={<FingerprintIcon />}
          titulo="Chave de acesso (biometria deste aparelho)"
          apoio={acesso.biometria === 'ativa' ? 'uma chave, só neste aparelho' : 'não cadastrada'}
          direita={
            acesso.biometria === 'ativa' ? (
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => { setAcesso((a) => ({ ...a, biometria: 'recusada' })); ctx.registrar('Apagou a chave de acesso (biometria) deste aparelho') }}>
                Apagar
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setAcesso((a) => ({ ...a, biometria: 'ativa' })); ctx.registrar('Cadastrou a chave de acesso (biometria) deste aparelho') }}>
                Cadastrar
              </Button>
            )
          }
        />
        <Linha
          icone={<KeyIcon />}
          titulo="Senha (opcional)"
          apoio={acesso.senha ? 'definida' : 'sem senha'}
          direita={
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => setSenha('nova')}>
                {acesso.senha ? 'Trocar' : 'Criar'}
              </Button>
              {acesso.senha && (
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setAcesso((a) => ({ ...a, senha: false }))}>
                  Tirar
                </Button>
              )}
            </div>
          }
        />
      </Bloco>
      <Bloco titulo="Histórico de entradas">
        {historicoEntradas.map((h) => (
          <Linha key={h.quando} titulo={`${h.quando} · ${h.aparelho}`} apoio={`${h.local} · ${h.forma}`} />
        ))}
      </Bloco>
      {ctx.areas.includes('societario') && (
        <Bloco titulo="Uso do certificado e dos links">
          {[
            ['17/11 06:10', 'captura de notas', 'automático'],
            ['16/11 14:22', 'situação fiscal (e-CAC)', 'escritório'],
            ['15/11 06:10', 'captura de notas', 'automático'],
          ].map(([q, s, por]) => (
            <Linha key={q} titulo={`${q} · ${s}`} apoio={por === 'escritório' ? 'pelo escritório' : 'automático'} />
          ))}
          {acessosLinks.map((a) => (
            <Linha key={a.quando + a.nome} titulo={`${a.quando} · link de ${a.nome}`} apoio={`aberto por ${a.para} · IP ${a.ip}`} />
          ))}
        </Bloco>
      )}
      {senha && (
        <Folha
          titulo={acesso.senha ? 'Trocar senha' : 'Criar senha'}
          onFechar={() => setSenha(null)}
          rodape={
            <Button
              className="rounded-full"
              disabled={valor.length < 8}
              onClick={() => {
                setAcesso((a) => ({ ...a, senha: true }))
                ctx.registrar(acesso.senha ? 'Trocou a senha do app' : 'Criou uma senha para o app')
                setSenha(null)
                setValor('')
                ctx.avisarApp('Senha salva. O código continua valendo.')
              }}
            >
              Salvar
            </Button>
          }
        >
          <Campo rotulo="Senha nova (mínimo 8)" tipo="password" valor={valor} onMudar={setValor} />
        </Folha>
      )}
    </div>
  )
}

function PreferenciasAviso({ ctx, voltar }: { ctx: Ctx; voltar: () => void }) {
  const [pref, setPref] = usePreferencias(ctx.pessoa)
  const [acesso, setAcesso] = useAcesso(ctx.pessoa)
  const [ligando, setLigando] = useState(false)
  const canais: [CanalAviso, string][] = [
    ['push', 'App'],
    ['whatsapp', 'WhatsApp'],
    ['email', 'E-mail'],
  ]
  const alternar = (cat: CategoriaAviso, c: CanalAviso) => setPref((p) => ({ ...p, canais: { ...p.canais, [cat]: p.canais[cat].includes(c) ? p.canais[cat].filter((x) => x !== c) : [...p.canais[cat], c] } }))
  return (
    <div className="flex flex-col gap-4">
      <TituloTela voltar={voltar}>Preferências de aviso</TituloTela>
      <Bloco titulo="Avisos no aparelho" acao={<Selo tom={acesso.push === 'permitido' ? 'ok' : 'neutro'}>{acesso.push === 'permitido' ? 'permitidos' : 'desligados'}</Selo>}>
        {acesso.push !== 'permitido' ? (
          <Button
            size="sm"
            variant="outline"
            className="w-fit rounded-full"
            disabled={ligando}
            onClick={() => {
              setLigando(true)
              registrarPush()
                .then(() => setAcesso((a) => ({ ...a, push: 'permitido', pushPerguntado: true })))
                .catch(() => ctx.avisarApp('Não deu para ligar agora; tente de novo.'))
                .finally(() => setLigando(false))
            }}
          >
            {ligando ? 'Ligando…' : 'Permitir avisos neste aparelho'}
          </Button>
        ) : (
          <p className="text-muted-foreground text-xs">Sem o app instalado ou sem permissão, os avisos vão pelo WhatsApp (com o seu aceite) e, por último, pelo e-mail.</p>
        )}
      </Bloco>
      <Bloco titulo="Por onde chega cada aviso">
        <div className="grid grid-cols-[1fr_repeat(3,auto)] items-center gap-x-2 gap-y-1.5 text-sm">
          <span />
          {canais.map(([, r]) => (
            <span key={r} className="text-muted-foreground text-center text-[11px]">
              {r}
            </span>
          ))}
          {(Object.keys(rotuloCategoria) as CategoriaAviso[]).map((cat) => (
            <div key={cat} className="contents">
              <span className="text-sm">{rotuloCategoria[cat]}</span>
              {canais.map(([c, r]) => (
                <label key={c} className="flex justify-center">
                  <input type="checkbox" aria-label={`${rotuloCategoria[cat]} por ${r}`} checked={pref.canais[cat].includes(c)} onChange={() => alternar(cat, c)} className="accent-primary size-4" />
                </label>
              ))}
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-[11px]">Conteúdo sensível (holerite, valor de honorário) nunca vai no texto do WhatsApp: só o link, que pede login.</p>
      </Bloco>
      <Bloco titulo="Silêncio e resumo">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={pref.silencio.ligado} onChange={(e) => setPref((p) => ({ ...p, silencio: { ...p.silencio, ligado: e.target.checked } }))} className="accent-primary size-4" /> Silêncio à noite
        </label>
        {pref.silencio.ligado && (
          <div className="grid grid-cols-2 gap-2">
            <Campo rotulo="De" tipo="time" valor={pref.silencio.de} onMudar={(v) => setPref((p) => ({ ...p, silencio: { ...p.silencio, de: v } }))} />
            <Campo rotulo="Até" tipo="time" valor={pref.silencio.ate} onMudar={(v) => setPref((p) => ({ ...p, silencio: { ...p.silencio, ate: v } }))} />
          </div>
        )}
        <p className="text-muted-foreground text-[11px]">Urgente (guia vencendo hoje sem pagamento, certificado a 5 dias) fura o silêncio.</p>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={pref.resumoDiario.ligado} onChange={(e) => setPref((p) => ({ ...p, resumoDiario: { ...p.resumoDiario, ligado: e.target.checked } }))} className="accent-primary size-4" /> Resumo diário do que não é urgente
        </label>
        {pref.resumoDiario.ligado && <Campo rotulo="Hora do resumo" tipo="time" valor={pref.resumoDiario.hora} onMudar={(v) => setPref((p) => ({ ...p, resumoDiario: { ...p.resumoDiario, hora: v } }))} />}
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={pref.resumoSemanal} onChange={(e) => setPref((p) => ({ ...p, resumoSemanal: e.target.checked }))} className="accent-primary size-4" /> Resumo semanal ("sua semana")
        </label>
        {pref.competenciasSilenciadas.length > 0 && (
          <p className="text-xs">
            Competências silenciadas: {pref.competenciasSilenciadas.join(', ')}{' '}
            <button type="button" className="cursor-pointer underline" onClick={() => setPref((p) => ({ ...p, competenciasSilenciadas: [] }))}>
              voltar a avisar
            </button>
          </p>
        )}
      </Bloco>
    </div>
  )
}

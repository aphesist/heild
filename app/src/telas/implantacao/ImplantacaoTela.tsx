import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, CheckCircleIcon, CheckIcon, CircleIcon, EnvelopeSimpleIcon, MagnifyingGlassIcon, PaletteIcon, SkipForwardIcon, SpinnerIcon, UploadSimpleIcon, UserPlusIcon, WhatsappLogoIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { useEscritorioCfg, useSetoresCfg } from '@/ambiente/configuracoes'
import { salvarContas, useContas, useLoja, useNavegacao, usePersistente } from '@/ambiente/loja'
import { useSessao } from '@/ambiente/sessao'
import { Caixa, TituloBloco } from '@/components/compostos/blocos'
import { EstadoErro, usePode } from '@/components/kit'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Campo, CampoEscolha, CampoTexto, Interruptor, Segmentado } from '@/components/ui/formulario'
import type { UsuarioCfg } from '@/dados/configuracoes'
import { definirEstadoConector, useEstadoConector } from '@/dados/conectores'
import { CHAVE_IMPLANTACAO, estadoImplantacaoInicial, modelosPapel, passosImplantacao, previaImportacao, type EstadoImplantacao, type IdPasso } from '@/dados/implantacao'
import { CHAVE_RAIOX, estadoRaioXInicial, type EstadoRaioX } from '@/dados/raiox'
import { cn } from '@/lib/utils'
import { registrar, repos } from '@/nucleo/repositorios'
import { esperarDemonstracao } from '../config/comum-s09'
import { MolduraTelaCheia, useTelasCheias } from '../config/telas-cheias'
import { useMarcaBranca } from '../config/marca-branca'

/**
 * Assistente de implantação do escritório (S09-T13; 03, 4.3): nove passos
 * até os critérios da fase 0, com o Geral conduzindo. Cada passo marca feito;
 * dá para pular e voltar. Concluir faz a faixa "primeiros passos" sumir da
 * Visão geral (`useImplantacao`).
 */
export function ImplantacaoTela({ onFechar }: { onFechar: () => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const pode = usePode('implantacao.conduzir')
  const [e, setE] = usePersistente<EstadoImplantacao>(CHAVE_IMPLANTACAO, estadoImplantacaoInicial)
  const passo = passosImplantacao[e.atual] ?? passosImplantacao[0]
  const feito = (id: IdPasso) => e.feitos.includes(id)
  const marcar = (id: IdPasso, ir = true) => {
    setE((x) => ({ ...x, feitos: [...new Set([...x.feitos, id])], pulados: x.pulados.filter((p) => p !== id), atual: ir ? Math.min(passosImplantacao.length - 1, x.atual + 1) : x.atual }))
    registrar(`${usuario.nome} concluiu o passo “${passosImplantacao.find((p) => p.id === id)?.titulo}” da implantação`, 'implantacao.passo')
  }
  const pular = () => setE((x) => ({ ...x, pulados: [...new Set([...x.pulados, passo.id])], atual: Math.min(passosImplantacao.length - 1, x.atual + 1) }))
  const ir = (i: number) => setE((x) => ({ ...x, atual: i }))
  const prontos = e.feitos.length
  const concluir = () => {
    setE((x) => ({ ...x, concluida_em: new Date().toISOString() }))
    registrar(`${usuario.nome} concluiu a implantação do escritório`, 'implantacao.concluir')
    loja.toast('Implantação concluída. A faixa “primeiros passos” saiu da Visão geral.', { modulo: 'inicio', aba: 'visao' }, 'Ver a Visão geral')
    onFechar()
  }

  return (
    <MolduraTelaCheia titulo="Implantação do escritório" sub={e.concluida_em ? `Concluída em ${new Date(e.concluida_em).toLocaleDateString('pt-BR')}` : `${prontos} de ${passosImplantacao.length} passos · o Assistente conduz`} onFechar={onFechar}>
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Caixa className="h-fit">
          <ol className="flex flex-col gap-0.5" aria-label="Passos">
            {passosImplantacao.map((p, i) => (
              <li key={p.id}>
                <button type="button" onClick={() => ir(i)} aria-current={i === e.atual ? 'step' : undefined} className={cn('hover:bg-sunken/60 flex w-full cursor-pointer items-start gap-2 rounded-[12px] px-2 py-1.5 text-left text-sm', i === e.atual && 'bg-sunken font-medium')}>
                  {feito(p.id) ? <CheckCircleIcon weight="fill" className="text-success mt-0.5 size-4 shrink-0" /> : e.pulados.includes(p.id) ? <SkipForwardIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" /> : <CircleIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />}
                  <span className="min-w-0 flex-1">
                    {i + 1}. {p.titulo}
                    {e.pulados.includes(p.id) && !feito(p.id) && <span className="text-muted-foreground block text-[11px] font-normal">pulado: volte quando quiser</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="bg-sunken h-1.5 overflow-hidden rounded-full" role="meter" aria-valuenow={prontos} aria-valuemax={passosImplantacao.length} aria-label="Progresso da implantação">
            <div className="bg-success h-full rounded-full transition-[width]" style={{ width: `${(prontos / passosImplantacao.length) * 100}%` }} />
          </div>
          {pode && !e.concluida_em && (
            <Button className="rounded-full" disabled={prontos < 5} onClick={concluir} title={prontos < 5 ? 'Faça ao menos dados, setores, equipe, clientes e armazenamento.' : undefined}>
              <CheckIcon /> Concluir implantação
            </Button>
          )}
          {e.concluida_em && (
            <Button variant="ghost" className="rounded-full" onClick={() => setE((x) => ({ ...x, concluida_em: null }))}>
              Reabrir implantação
            </Button>
          )}
        </Caixa>

        <Caixa className="min-h-[28rem]">
          <TituloBloco descricao={`${passo.resumo} · ${passo.fonte}`}>
            {e.atual + 1}. {passo.titulo} {feito(passo.id) && <Badge variant="sucesso">feito</Badge>}
          </TituloBloco>
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {passo.id === 'dados' && <PassoDados onFeito={() => marcar('dados')} />}
            {passo.id === 'setores' && <PassoSetores onFeito={() => marcar('setores')} />}
            {passo.id === 'equipe' && <PassoEquipe onFeito={() => marcar('equipe')} />}
            {passo.id === 'clientes' && <PassoClientes e={e} setE={setE} />}
            {passo.id === 'armazenamento' && <PassoArmazenamento onFeito={() => marcar('armazenamento')} />}
            {passo.id === 'canais' && <PassoCanais onFeito={() => marcar('canais')} />}
            {passo.id === 'tema' && <PassoTema onFeito={() => marcar('tema')} onFechar={onFechar} />}
            {passo.id === 'campanha' && <PassoCampanha e={e} />}
            {passo.id === 'migracao' && <PassoMigracao e={e} setE={setE} onFeito={() => marcar('migracao', false)} />}
          </div>
          <footer className="flex flex-wrap items-center gap-2 border-t pt-3">
            <Button variant="ghost" className="rounded-full" disabled={e.atual === 0} onClick={() => ir(e.atual - 1)}>
              <ArrowLeftIcon /> Voltar
            </Button>
            {!feito(passo.id) && (
              <Button variant="ghost" className="ml-auto rounded-full" onClick={pular}>
                <SkipForwardIcon /> Pular por agora
              </Button>
            )}
            <Button variant="outline" className={cn('rounded-full', feito(passo.id) && 'ml-auto')} disabled={e.atual === passosImplantacao.length - 1} onClick={() => ir(e.atual + 1)}>
              Próximo <ArrowRightIcon />
            </Button>
          </footer>
        </Caixa>
      </div>
    </MolduraTelaCheia>
  )
}

/* ---------- Passos ---------- */

function PassoDados({ onFeito }: { onFeito: () => void }) {
  const [esc, setEsc] = useEscritorioCfg()
  const [d, setD] = useState({ razao: esc.razaoSocial, cnpj: esc.cnpj, crc: esc.crc, fuso: esc.fuso })
  const cnpjOk = d.cnpj.replace(/\D/g, '').length === 14
  return (
    <>
      <p className="text-sm">O Assistente já preencheu o que achou no cartão CNPJ. Confira e confirme.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Razão social">{(id) => <CampoTexto id={id} valor={d.razao} onMudar={(v) => setD({ ...d, razao: v })} />}</Campo>
        <Campo rotulo="CNPJ" erro={!cnpjOk ? 'CNPJ com 14 números.' : undefined}>
          {(id) => <CampoTexto id={id} valor={d.cnpj} onMudar={(v) => setD({ ...d, cnpj: v })} mono />}
        </Campo>
        <Campo rotulo="CRC">{(id) => <CampoTexto id={id} valor={d.crc} onMudar={(v) => setD({ ...d, crc: v })} />}</Campo>
        <Campo rotulo="Fuso">
          {(id) => (
            <CampoEscolha
              id={id}
              valor={d.fuso}
              onMudar={(v) => setD({ ...d, fuso: v })}
              opcoes={['America/Sao_Paulo', 'America/Manaus', 'America/Cuiaba', 'America/Recife', 'America/Belem'].map((f) => ({ valor: f, rotulo: f.replace('America/', '').replace('_', ' ') }))}
            />
          )}
        </Campo>
      </div>
      <Button
        className="w-fit rounded-full"
        disabled={!cnpjOk || !d.razao.trim()}
        onClick={() => {
          setEsc({ ...esc, razaoSocial: d.razao.trim(), cnpj: d.cnpj, crc: d.crc, fuso: d.fuso })
          onFeito()
        }}
      >
        <CheckIcon /> Confirmar dados
      </Button>
    </>
  )
}

function PassoSetores({ onFeito }: { onFeito: () => void }) {
  const [setores, setSetores] = useSetoresCfg()
  const contas = useContas().filter((u) => u.situacao === 'ativo')
  const { usuario } = useSessao()
  const comEquipe = setores.filter((s) => s.temEquipe)
  return (
    <>
      <p className="text-sm">Desative o que o escritório não atende (as obrigações dele somem). O responsável padrão vem preenchido com você.</p>
      <ul className="divide-border/70 flex flex-col divide-y">
        {comEquipe.map((s) => (
          <li key={s.codigo} className="flex flex-wrap items-center gap-3 py-2">
            <span className={cn('min-w-0 flex-1 text-sm', !s.ativo && 'text-muted-foreground')}>{s.nomeExibido}</span>
            <span className="w-48">
              <CampoEscolha rotulo={`Responsável por ${s.nomeExibido}`} valor={s.responsavel ?? usuario.nome} onMudar={(v) => setSetores((xs) => xs.map((x) => (x.codigo === s.codigo ? { ...x, responsavel: v } : x)))} opcoes={contas.map((c) => ({ valor: c.nome, rotulo: c.nome }))} />
            </span>
            <Interruptor ocultarRotulo rotulo={`${s.nomeExibido} ativo`} ligado={s.ativo} onMudar={(v) => setSetores((xs) => xs.map((x) => (x.codigo === s.codigo ? { ...x, ativo: v } : x)))} />
          </li>
        ))}
      </ul>
      <Button
        className="w-fit rounded-full"
        onClick={() => {
          setSetores((xs) => xs.map((x) => (x.temEquipe && !x.responsavel ? { ...x, responsavel: usuario.nome } : x)))
          onFeito()
        }}
      >
        <CheckIcon /> Setores conferidos
      </Button>
    </>
  )
}

function PassoEquipe({ onFeito }: { onFeito: () => void }) {
  const contas = useContas()
  const loja = useLoja()
  const { usuario } = useSessao()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [modelo, setModelo] = useState('recepcao')
  const m = modelosPapel.find((x) => x.id === modelo)!
  const repetido = contas.some((c) => c.email === email.trim().toLowerCase())
  const ok = nome.trim() && /^\S+@\S+\.\S+$/.test(email) && !repetido
  const convidados = contas.filter((c) => c.situacao === 'convidado')
  const convidar = () => {
    const u: UsuarioCfg = {
      id: `u${Date.now()}`,
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      papel: m.papel,
      situacao: 'convidado',
      vinculos: m.vinculos,
      excecoes: m.apoio ? [{ id: `x${Date.now()}`, tela: 'aba.fiscal', efeito: 'liberar', nivel: 'rascunhar', motivo: 'perfil de apoio (Recepção): separar, consultar, cobrar e digitalizar' }] : [],
      carteira: [],
      segundoFator: m.papel === 'administrador',
      ultimoAcesso: 'convite enviado agora',
    }
    try {
      salvarContas([...contas, u])
      repos.convites.criar({ tipo: 'usuario_escritorio', destino: u.email, papel_proposto: u.papel, setores_propostos: u.vinculos.map((v) => v.setor), expira_em: new Date(Date.now() + 7 * 86_400_000).toISOString(), enviado_por: usuario.id })
      loja.toast(`Convite enviado para ${u.email} (${m.nome}). Vale 7 dias.`)
      setNome('')
      setEmail('')
    } catch (err) {
      loja.toastErro(err instanceof Error ? err.message : String(err))
    }
  }
  return (
    <>
      <p className="text-sm">Recepção, Supervisão e Direção são papéis prontos (E-05): escolha o modelo e o convite já sai com o papel, os setores e as exceções.</p>
      <Segmentado rotulo="Modelo de papel" valor={modelo} onMudar={setModelo} opcoes={modelosPapel.map((x) => ({ valor: x.id, rotulo: x.nome }))} />
      <p className="text-muted-foreground text-xs">{m.descricao}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Nome">{(id) => <CampoTexto id={id} valor={nome} onMudar={setNome} />}</Campo>
        <Campo rotulo="E-mail" erro={repetido ? 'Já existe uma pessoa com esse e-mail.' : undefined}>
          {(id) => <CampoTexto id={id} tipo="email" valor={email} onMudar={setEmail} />}
        </Campo>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button className="rounded-full" disabled={!ok} onClick={convidar}>
          <UserPlusIcon /> Convidar
        </Button>
        <Button variant="outline" className="rounded-full" onClick={onFeito}>
          <CheckIcon /> Equipe convidada
        </Button>
      </div>
      {convidados.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {convidados.map((c) => (
            <li key={c.id} className="text-muted-foreground">
              {c.nome} · {c.email} · convite pendente
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function PassoClientes({ e, setE }: { e: EstadoImplantacao; setE: (f: (x: EstadoImplantacao) => EstadoImplantacao) => void }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const [fonte, setFonte] = useState('core')
  const [lendo, setLendo] = useState(false)
  const [erro, setErro] = useState('')
  const imp = e.importacao
  const fontes = [
    { valor: 'core', rotulo: 'Sistema contábil (Alterdata, Domínio, Questor)' },
    { valor: 'planilha', rotulo: 'Planilha' },
    { valor: 'acessorias', rotulo: 'Acessórias' },
  ]
  const ler = async () => {
    setLendo(true)
    setErro('')
    try {
      await esperarDemonstracao(1400)
      setE((x) => ({ ...x, importacao: { fonte: fontes.find((f) => f.valor === fonte)!.rotulo, linhas: previaImportacao(fonte, loja.clientes), enviada_em: null, gravada_em: null } }))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'A leitura não respondeu.')
    } finally {
      setLendo(false)
    }
  }
  const enviar = () => {
    const n = imp!.linhas.filter((l) => l.incluir && !l.existente).length
    setE((x) => ({ ...x, importacao: x.importacao && { ...x.importacao, enviada_em: new Date().toISOString() } }))
    loja.mensagemTime('i-geral', {
      autor: { tipo: 'integrante', setor: 'geral' },
      texto: `Conferi a importação de ${imp!.fonte}: ${n} cliente(s) novos prontos para gravar; ${imp!.linhas.filter((l) => l.divergencia).length} com divergência ficaram de fora; ${imp!.linhas.filter((l) => l.existente).length} já estavam no cadastro.`,
      cartoes: [{ tipo: 'aprovacao', id: `s09-importar-${Date.now()}`, resumo: `Gravar ${n} cliente(s) importado(s)`, argumentos: [{ rotulo: 'Fonte', valor: imp!.fonte }, { rotulo: 'Novos', valor: String(n) }, { rotulo: 'Situação', valor: 'em implantação' }], lote: n, expiraEm: 'expira em 3 dias' }],
    })
    registrar(`${usuario.nome} enviou a importação de ${n} cliente(s) para aprovação`, 'implantacao.importar')
    loja.toast('Cartão de aprovação no chat do Assistente. Nada é gravado antes do sim.', { modulo: 'inicio', aba: 'assistente' }, 'Abrir o Assistente')
  }
  return (
    <>
      {!imp || !imp.linhas.length ? (
        <>
          <Campo rotulo="De onde vêm os clientes">{(id) => <CampoEscolha id={id} valor={fonte} onMudar={setFonte} opcoes={fontes} />}</Campo>
          {erro && <EstadoErro titulo="Não leu" descricao={erro} onTentar={() => void ler()} />}
          <Button className="w-fit rounded-full" disabled={lendo} onClick={() => void ler()}>
            {lendo ? <SpinnerIcon className="animate-spin" /> : <UploadSimpleIcon />} {lendo ? 'Lendo e conferindo…' : 'Ler e conferir'}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm">
            Prévia de {imp.fonte}. Divergências ficam desmarcadas; marque ou desmarque o que entra. {imp.gravada_em ? 'Gravado.' : imp.enviada_em ? 'Enviado para aprovação: decida o cartão no chat do Assistente.' : ''}
          </p>
          <ul className="divide-border/70 flex flex-col divide-y">
            {imp.linhas.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <input
                  type="checkbox"
                  aria-label={`Incluir ${l.nome}`}
                  checked={l.incluir}
                  disabled={!!l.existente || !!imp.enviada_em}
                  onChange={(ev) => setE((x) => ({ ...x, importacao: x.importacao && { ...x.importacao, linhas: x.importacao.linhas.map((y) => (y.id === l.id ? { ...y, incluir: ev.target.checked } : y)) } }))}
                  className="accent-foreground size-4"
                />
                <span className="min-w-0 flex-1">
                  {l.codigo} · {l.nome}
                  <span className="text-muted-foreground block text-xs">
                    {l.documento} · {l.regime}
                  </span>
                </span>
                {l.existente ? <Badge variant="outline">já no cadastro</Badge> : l.divergencia ? <Badge variant="destaque">{l.divergencia}</Badge> : <Badge variant="sucesso">ok</Badge>}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            {!imp.enviada_em && (
              <Button className="rounded-full" disabled={!imp.linhas.some((l) => l.incluir && !l.existente)} onClick={enviar}>
                Enviar para aprovação
              </Button>
            )}
            {!imp.enviada_em && (
              <Button variant="ghost" className="rounded-full" onClick={() => setE((x) => ({ ...x, importacao: null }))}>
                Ler de outra fonte
              </Button>
            )}
          </div>
        </>
      )}
    </>
  )
}

function PassoArmazenamento({ onFeito }: { onFeito: () => void }) {
  const drive = useEstadoConector('google_drive')
  const antigo = useEstadoConector('drive_antigo')
  const { abrir } = useTelasCheias()
  const [rx] = usePersistente<EstadoRaioX>(CHAVE_RAIOX, estadoRaioXInicial)
  const nav = useNavegacao()
  return (
    <>
      <ul className="flex flex-col gap-2 text-sm">
        <li className="flex flex-wrap items-center gap-2">
          {drive.funcionando ? <CheckCircleIcon weight="fill" className="text-success size-4" /> : <CircleIcon className="size-4" />} Nuvem padrão: {drive.nome} · {drive.rotulo}
          {!drive.funcionando && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => definirEstadoConector('google_drive', { estado: 'ativo', ultima_execucao: new Date().toISOString() })}>
              Conectar
            </Button>
          )}
        </li>
        <li className="flex flex-wrap items-center gap-2">
          {antigo.funcionando ? <CheckCircleIcon weight="fill" className="text-success size-4" /> : <CircleIcon className="size-4" />} Drive antigo (só leitura): {antigo.rotulo}
          {!antigo.funcionando && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => definirEstadoConector('drive_antigo', { estado: 'somente_leitura', ultima_execucao: new Date().toISOString() })}>
              Conectar em leitura
            </Button>
          )}
        </li>
        <li className="flex flex-wrap items-center gap-2">
          {rx.rodado_em ? <CheckCircleIcon weight="fill" className="text-success size-4" /> : <CircleIcon className="size-4" />} Raio-X do Drive: {rx.rodado_em ? (rx.aplicado_em ? 'rodado e aplicado' : 'rodado, achados esperando decisão') : 'ainda não rodou'}
        </li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button className="rounded-full" disabled={!antigo.funcionando} onClick={() => abrir('raiox')}>
          <MagnifyingGlassIcon /> Rodar o Raio-X
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'config', aba: 'armazenamento' })}>
          Abrir Armazenamento
        </Button>
        <Button variant="outline" className="rounded-full" disabled={!drive.funcionando} onClick={onFeito}>
          <CheckIcon /> Armazenamento pronto
        </Button>
      </div>
    </>
  )
}

function PassoCanais({ onFeito }: { onFeito: () => void }) {
  const wa = useEstadoConector('whatsapp')
  const email = useEstadoConector('email')
  const nav = useNavegacao()
  const [ligando, setLigando] = useState<string | null>(null)
  const ligar = async (id: 'whatsapp' | 'email') => {
    setLigando(id)
    await esperarDemonstracao(1100)
    definirEstadoConector(id, { estado: 'ativo', ultima_execucao: new Date().toISOString() })
    setLigando(null)
  }
  return (
    <>
      <ul className="flex flex-col gap-3 text-sm">
        <li className="flex flex-wrap items-center gap-2">
          <WhatsappLogoIcon className="size-5" /> WhatsApp (um número por setor): {wa.rotulo}
          {!wa.funcionando && (
            <Button size="sm" variant="outline" className="rounded-full" disabled={ligando === 'whatsapp'} onClick={() => void ligar('whatsapp')}>
              {ligando === 'whatsapp' ? 'Conectando…' : 'Conectar pela Meta'}
            </Button>
          )}
        </li>
        <li className="flex flex-wrap items-center gap-2">
          <EnvelopeSimpleIcon className="size-5" /> E-mail do escritório (lê entrada, enviados e anexos): {email.rotulo}
          {!email.funcionando && (
            <Button size="sm" variant="outline" className="rounded-full" disabled={ligando === 'email'} onClick={() => void ligar('email')}>
              {ligando === 'email' ? 'Conectando…' : 'Conectar e-mail'}
            </Button>
          )}
        </li>
      </ul>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" className="rounded-full" onClick={() => nav.irPara({ modulo: 'crm', aba: 'numeros' })}>
          Números e mensagens automáticas no CRM
        </Button>
        <Button variant="outline" className="rounded-full" disabled={!wa.funcionando && !email.funcionando} onClick={onFeito}>
          <CheckIcon /> Canais prontos
        </Button>
      </div>
    </>
  )
}

function PassoTema({ onFeito, onFechar }: { onFeito: () => void; onFechar: () => void }) {
  const { contratada } = useMarcaBranca()
  const nav = useNavegacao()
  return contratada ? (
    <>
      <p className="text-sm">Com a marca branca, o sistema e o app dos clientes saem com o logotipo, as cores e o domínio do escritório.</p>
      <div className="flex flex-wrap gap-2">
        <Button className="rounded-full" onClick={() => (onFechar(), nav.irPara({ modulo: 'config', aba: 'tema' }))}>
          <PaletteIcon /> Abrir o Tema
        </Button>
        <Button variant="outline" className="rounded-full" onClick={onFeito}>
          <CheckIcon /> Tema publicado
        </Button>
      </div>
    </>
  ) : (
    <>
      <p className="text-sm">Sem o complemento de marca branca, o escritório usa o tema padrão da plataforma. Este passo pode ser pulado.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="rounded-full" onClick={() => (onFechar(), nav.irPara({ modulo: 'config', aba: 'assinatura' }))}>
          Conhecer a marca branca
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={onFeito}>
          Seguir com o tema padrão
        </Button>
      </div>
    </>
  )
}

function PassoCampanha({ e }: { e: EstadoImplantacao }) {
  const loja = useLoja()
  const { usuario } = useSessao()
  const semAcesso = loja.clientes.filter((_, i) => i % 3 !== 0)
  const disparar = () => {
    loja.mensagemTime('i-societario', {
      autor: { tipo: 'integrante', setor: 'societario' },
      texto: `Preparei a campanha de acessos: ${semAcesso.length} cliente(s) recebem o pedido de procuração no e-CAC (SOC-014) e os logins de prefeitura e Sefaz (SOC-011), pelo app e pelo WhatsApp. Eu acompanho e cobro quem não responder.`,
      cartoes: [{ tipo: 'aprovacao', id: `s09-campanha-${Date.now()}`, resumo: `Enviar a campanha de acessos para ${semAcesso.length} cliente(s)`, argumentos: [{ rotulo: 'Canal', valor: 'app e WhatsApp' }, { rotulo: 'Lembrete', valor: 'em 3 e 7 dias' }], lote: semAcesso.length, expiraEm: 'expira em 2 dias' }],
    })
    registrar(`${usuario.nome} pediu a campanha de acessos ao Societário`, 'implantacao.campanha')
    loja.toast('Cartão em lote no chat do Societário. Nada sai ao cliente sem o seu sim.', { modulo: 'inicio', aba: 'time', integrante: 'i-societario' }, 'Abrir o Societário')
  }
  return (
    <>
      <p className="text-sm">{semAcesso.length} cliente(s) ainda sem procuração RFB ou sem login de portal no cofre. O Societário prepara o pedido para todos de uma vez.</p>
      <ul className="text-muted-foreground flex flex-wrap gap-1.5 text-xs">
        {semAcesso.map((c) => (
          <li key={c.id} className="bg-sunken rounded-full px-2 py-0.5">
            {c.nome}
          </li>
        ))}
      </ul>
      {e.campanha_em ? (
        <p className="text-success flex items-center gap-1.5 text-sm">
          <CheckCircleIcon weight="fill" className="size-4" /> Campanha enviada em {new Date(e.campanha_em).toLocaleDateString('pt-BR')}.
        </p>
      ) : (
        <Button className="w-fit rounded-full" disabled={!semAcesso.length} onClick={disparar}>
          Disparar campanha (cartão em lote)
        </Button>
      )}
    </>
  )
}

function PassoMigracao({ e, setE, onFeito }: { e: EstadoImplantacao; setE: (f: (x: EstadoImplantacao) => EstadoImplantacao) => void; onFeito: () => void }) {
  const mover = (i: number, d: -1 | 1) =>
    setE((x) => {
      const o = [...x.ondas]
      const j = i + d
      if (j < 0 || j >= o.length) return x
      ;[o[i], o[j]] = [o[j], o[i]]
      return { ...x, ondas: o }
    })
  return (
    <>
      <p className="text-sm">Uma onda por ferramenta antiga, na ordem que fizer sentido. Cada onda roda em paralelo com a ferramenta antiga até a conferência bater (modo sombra).</p>
      <ol className="flex flex-col gap-2">
        {e.ondas.map((o, i) => (
          <li key={o.id} className="bg-sunken/50 flex flex-wrap items-center gap-2 rounded-[14px] px-3 py-2 text-sm">
            <span className="bg-raised flex size-6 items-center justify-center rounded-full text-xs">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-medium">{o.ferramenta}</span>
              <span className="text-muted-foreground block text-xs">
                {o.o_que} · {o.quando}
              </span>
            </span>
            <Badge variant={o.situacao === 'feita' ? 'sucesso' : o.situacao === 'em_andamento' ? 'destaque' : 'outline'}>{o.situacao.replace('_', ' ')}</Badge>
            {!e.plano_aprovado_em && (
              <span className="flex">
                <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Subir ${o.ferramenta}`} disabled={i === 0} onClick={() => mover(i, -1)}>
                  <ArrowUpIcon />
                </Button>
                <Button size="icon-sm" variant="ghost" className="rounded-full" aria-label={`Descer ${o.ferramenta}`} disabled={i === e.ondas.length - 1} onClick={() => mover(i, 1)}>
                  <ArrowDownIcon />
                </Button>
              </span>
            )}
          </li>
        ))}
      </ol>
      {e.plano_aprovado_em ? (
        <p className="text-success flex items-center gap-1.5 text-sm">
          <CheckCircleIcon weight="fill" className="size-4" /> Plano aprovado em {new Date(e.plano_aprovado_em).toLocaleDateString('pt-BR')}.
        </p>
      ) : (
        <Button
          className="w-fit rounded-full"
          onClick={() => {
            setE((x) => ({ ...x, plano_aprovado_em: new Date().toISOString(), ondas: x.ondas.map((o, i) => (i === 0 ? { ...o, situacao: 'em_andamento' } : o)) }))
            onFeito()
          }}
        >
          <CheckIcon /> Aprovar plano
        </Button>
      )}
    </>
  )
}

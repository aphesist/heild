import { AndroidLogoIcon, AppleLogoIcon, ArrowLeftIcon, ChatCircleTextIcon, EnvelopeSimpleIcon, EnvelopeOpenIcon, FingerprintIcon, KeyIcon, LockSimpleIcon, ShareIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLoja } from '@/ambiente/loja'
import { SiglaMarca } from '@/components/compostos/barra-lateral'
import { ehHeild, Marca } from '@/components/compostos/marca'
import { SeloDemonstracao } from '@/components/kit'
import { Button } from '@/components/ui/button'
import { useTema } from '@/theme/ThemeProvider'
import { contextoSistema } from '@/nucleo/permissoes/perfil'
import { comoAtor } from '@/nucleo/repositorios/contexto'
import { cn } from '@/lib/utils'
import type { ContatoCliente } from '@/ambiente/clientes'
import { idDoUsuario, useDominioApp, useNomeEscritorio, type PessoaApp } from './contexto'
import { agoraTexto, HOJE, textosDoApp, type ConviteApp } from './dados'
import { useAcesso, useConvites, type AcessoPessoa } from './estado'
import { Campo, classeCampo, Faixa } from './pecas'
import { enviarCodigo } from './simulados'
import { AreaRolagem } from '@/components/ui/area-rolagem'

/**
 * S10-T01 · Entrada, primeiro acesso e convite (06, 2.1 e 2.2). Sem senha:
 * código de 6 dígitos (10 minutos, 5 tentativas) no WhatsApp ou e-mail que
 * está na ficha. Contato fora da ficha é barrado. O convite abre na marca do
 * escritório, confirma a identidade, pede o termo de uso e a forma de entrar.
 */

type Passo = { p: 'contato' } | { p: 'codigo'; alvo: Alvo } | { p: 'senha'; alvo: Alvo } | { p: 'convites' } | { p: 'termo'; alvo: Alvo } | { p: 'forma'; alvo: Alvo } | { p: 'instalar'; alvo: Alvo } | { p: 'bloqueado' }

/** Quem está entrando: uma pessoa que já usa o app, ou um contato convidado (ainda sem acesso). */
interface Alvo {
  nome: string
  canal: 'whatsapp' | 'email'
  destino: string
  convite?: ConviteApp
}

export function EntradaApp({ pessoas, onEntrar }: { pessoas: PessoaApp[]; onEntrar: (nome: string) => void }) {
  const { tema } = useTema()
  const loja = useLoja()
  const nomeEscritorio = useNomeEscritorio()
  const textos = textosDoApp(tema, nomeEscritorio)
  const dominio = useDominioApp()
  const [passo, setPasso] = useState<Passo>({ p: 'contato' })
  const [convites, setConvites] = useConvites()
  const [contato, setContato] = useState('')
  const normal = (s: string) => s.replace(/[\s()-]/g, '').toLowerCase()
  const achado = pessoas.find((x) => x.empresas.some((e) => (e.contato.whatsapp && normal(e.contato.whatsapp) === normal(contato)) || (e.contato.email && normal(e.contato.email) === normal(contato))))
  const alvoDe = (p: PessoaApp): Alvo => {
    const c = p.empresas.find((e) => (e.contato.whatsapp && normal(e.contato.whatsapp) === normal(contato)) || (e.contato.email && normal(e.contato.email) === normal(contato)))?.contato ?? p.empresas[0].contato
    const porEmail = !!c.email && normal(c.email) === normal(contato)
    return { nome: p.nome, canal: porEmail || !c.whatsapp ? 'email' : 'whatsapp', destino: porEmail || !c.whatsapp ? (c.email ?? '') : c.whatsapp }
  }

  const concluirConvite = (alvo: Alvo, acesso: AcessoPessoa) => {
    const cv = alvo.convite!
    const f = loja.fichaDe(cv.clienteId)
    if (f) {
      const novo: ContatoCliente = { nome: cv.nome, papel: cv.papel, assuntos: cv.assuntos, app: true, ...(cv.canal === 'whatsapp' ? { whatsapp: cv.destino } : { email: cv.destino }) }
      const existe = f.contatos.some((c) => c.nome === cv.nome)
      // Aceitar o convite liga o contato ao app (conta.convite.aceitar): quem grava é o sistema, não o cliente.
      comoAtor(contextoSistema, () => loja.salvarFicha({ ...f, contatos: existe ? f.contatos.map((c) => (c.nome === cv.nome ? { ...c, ...novo } : c)) : [...f.contatos, novo] }))
    }
    setConvites((l) => l.map((x) => (x.id === cv.id ? { ...x, situacao: 'aceito' } : x)))
    const cliente = loja.clientes.find((c) => c.id === cv.clienteId)?.nome ?? ''
    loja.registrar(`${cv.nome} (cliente, app)`, `Aceitou o convite do app e o termo de uso ${textos.termoVersao} (${cliente}); entra por ${acesso.senha ? 'código ou senha' : 'código'}${acesso.biometria === 'ativa' ? ' e biometria' : ''}`)
    loja.avisar({ para: [idDoUsuario(cv.pedidoPor.replace(/ \(.*/, '')) ?? 'u4'], tipo: 'cliente', setor: 'gestao_atendimento', titulo: `${cv.nome} aceitou o convite do app`, detalhe: `${cliente} · ${cv.papel}`, destino: { modulo: 'painel', aba: 'societario', ficha: cv.clienteId } })
  }

  return (
    <AreaRolagem className="flex h-full flex-col gap-5 px-6 py-8 [&>*]:shrink-0">
      <div className="-ml-2 flex items-center gap-2.5">
        {ehHeild(tema) ? <Marca /> : <SiglaMarca />}
        <span>
          {!ehHeild(tema) && <span className="block font-medium">{textos.produto}</span>}
          <span className="text-muted-foreground flex items-center gap-1 text-xs">
            <LockSimpleIcon className="size-3" /> {dominio}
          </span>
        </span>
      </div>

      {passo.p === 'contato' && (
        <>
          <h1 className="text-2xl font-light tracking-tight">Entrar</h1>
          <p className="text-muted-foreground text-sm">Use o WhatsApp ou o e-mail que o escritório tem de você. Mandamos um código de 6 números. Não tem senha para lembrar.</p>
          <input aria-label="WhatsApp ou e-mail" value={contato} onChange={(e) => setContato(e.target.value)} placeholder="+55 11 9…  ou  voce@empresa.com.br" className={classeCampo} />
          <Button className="rounded-full" disabled={!achado} onClick={() => achado && setPasso({ p: 'codigo', alvo: alvoDe(achado) })}>
            Receber código
          </Button>
          {achado && <EntradasRapidas pessoa={achado.nome} onSenha={() => setPasso({ p: 'senha', alvo: alvoDe(achado) })} onEntrar={onEntrar} />}
          {contato.trim().length > 5 && !achado && (
            <Faixa tom="erro" icone={<WarningCircleIcon weight="fill" />}>
              Não achamos esse contato na ficha da sua empresa. Peça o convite ao escritório: ele cadastra o seu WhatsApp ou e-mail e manda o link.
            </Faixa>
          )}
          <button type="button" className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1.5 text-sm underline-offset-2 hover:underline" onClick={() => setPasso({ p: 'convites' })}>
            <EnvelopeOpenIcon className="size-4" /> Recebi um convite
          </button>
          <div className="mt-1 flex flex-col gap-1.5">
            <p className="text-muted-foreground text-xs">Na demonstração, toque em uma pessoa:</p>
            {pessoas.length === 0 && <p className="bg-sunken rounded-[14px] px-3 py-2 text-sm">Nenhum contato deste escritório usa o app ainda. O escritório liga o app de cada contato na ficha do cliente e manda o convite.</p>}
            {pessoas.map((x) => (
              <button
                key={x.nome}
                type="button"
                onClick={() => setContato(x.empresas[0].contato.whatsapp ?? x.empresas[0].contato.email ?? '')}
                className="bg-raised shadow-cartao flex cursor-pointer flex-col rounded-[14px] px-3 py-2 text-left text-sm"
              >
                <span className="font-medium">{x.nome}</span>
                <span className="text-muted-foreground text-xs">{x.empresas.map((e) => `${loja.clientes.find((c) => c.id === e.clienteId)?.nome} (${e.contato.papel})`).join(' · ')}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {passo.p === 'convites' && (
        <>
          <Voltar onClick={() => setPasso({ p: 'contato' })} />
          <h1 className="text-2xl font-light tracking-tight">Convites</h1>
          <p className="text-muted-foreground text-sm">O link do convite vale 7 dias e abre aqui, já com a marca do escritório. Na demonstração, escolha um convite enviado:</p>
          {convites.filter((c) => c.situacao !== 'cancelado').length === 0 && <p className="bg-sunken rounded-[14px] px-3 py-2 text-sm">Nenhum convite enviado.</p>}
          {convites
            .filter((c) => c.situacao !== 'cancelado' && loja.clientes.some((x) => x.id === c.clienteId))
            .map((c) => (
              <ConviteCartao
                key={c.id}
                c={c}
                empresa={loja.clientes.find((x) => x.id === c.clienteId)?.nome ?? ''}
                onAbrir={() => setPasso({ p: 'codigo', alvo: { nome: c.nome, canal: c.canal, destino: c.destino, convite: c } })}
                onPedirNovo={() => {
                  loja.registrar(`${c.nome} (convidado)`, `Pediu um convite novo: o anterior venceu em ${c.expiraEm}`)
                  loja.avisar({ para: ['u4'], tipo: 'cliente', setor: 'gestao_atendimento', titulo: `${c.nome} pediu um convite novo do app`, detalhe: `${loja.clientes.find((x) => x.id === c.clienteId)?.nome} · o anterior venceu`, destino: { modulo: 'painel', aba: 'societario', ficha: c.clienteId } })
                  setConvites((l) => l.map((x) => (x.id === c.id ? { ...x, situacao: 'pendente', enviadoEm: HOJE, expiraEm: '25/11/2026', reenvios: x.reenvios + 1 } : x)))
                }}
              />
            ))}
        </>
      )}

      {passo.p === 'codigo' && (
        <PassoCodigo
          alvo={passo.alvo}
          onVoltar={() => setPasso(passo.alvo.convite ? { p: 'convites' } : { p: 'contato' })}
          onBloqueado={() => {
            loja.avisar({ para: ['u4'], tipo: 'sistema', setor: 'gestao_atendimento', titulo: `Entrada bloqueada no app: ${passo.alvo.nome}`, detalhe: '5 códigos errados seguidos; libera sozinho em 15 minutos', destino: { modulo: 'crm', aba: 'conversas' } })
            loja.registrar(`${passo.alvo.nome} (cliente, app)`, 'Errou o código 5 vezes; entrada bloqueada por 15 minutos')
            setPasso({ p: 'bloqueado' })
          }}
          onOk={() => setPasso(passo.alvo.convite ? { p: 'termo', alvo: passo.alvo } : { p: 'termo', alvo: passo.alvo })}
          primeiroAcesso={!!passo.alvo.convite}
          onEntrar={onEntrar}
        />
      )}

      {passo.p === 'senha' && <PassoSenha alvo={passo.alvo} onVoltar={() => setPasso({ p: 'contato' })} onEntrar={onEntrar} />}

      {passo.p === 'bloqueado' && (
        <>
          <h1 className="text-2xl font-light tracking-tight">Entrada bloqueada</h1>
          <Faixa tom="erro" icone={<WarningCircleIcon weight="fill" />}>
            Foram 5 códigos errados. Por segurança, a entrada fica bloqueada por 15 minutos e o escritório foi avisado.
          </Faixa>
          <Button variant="outline" className="rounded-full" onClick={() => setPasso({ p: 'contato' })}>
            Voltar ao começo
          </Button>
        </>
      )}

      {passo.p === 'termo' && <PassoTermo alvo={passo.alvo} textos={textos} onAceitar={() => setPasso({ p: 'forma', alvo: passo.alvo })} onEntrar={onEntrar} />}
      {passo.p === 'forma' && <PassoForma alvo={passo.alvo} onPronto={() => setPasso({ p: 'instalar', alvo: passo.alvo })} />}
      {passo.p === 'instalar' && (
        <PassoInstalar
          alvo={passo.alvo}
          onPronto={(acesso) => {
            if (passo.alvo.convite) concluirConvite(passo.alvo, acesso)
            onEntrar(passo.alvo.nome)
          }}
        />
      )}
    </AreaRolagem>
  )
}

function Voltar({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-muted-foreground flex w-fit cursor-pointer items-center gap-1 text-sm">
      <ArrowLeftIcon className="size-4" /> Voltar
    </button>
  )
}

function ConviteCartao({ c, empresa, onAbrir, onPedirNovo }: { c: ConviteApp; empresa: string; onAbrir: () => void; onPedirNovo: () => void }) {
  return (
    <div className="bg-raised shadow-cartao flex flex-col gap-1.5 rounded-[16px] px-3.5 py-3 text-sm">
      <span className="font-medium">
        {c.nome} <span className="text-muted-foreground font-normal">· {c.papel}</span>
      </span>
      <span className="text-muted-foreground text-xs">
        {empresa} · por {c.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'} ({c.destino}) · enviado em {c.enviadoEm.slice(0, 5)}
      </span>
      {c.situacao === 'pendente' && (
        <>
          <span className="text-muted-foreground text-xs">Vale até {c.expiraEm}.</span>
          <Button size="sm" className="w-fit rounded-full" onClick={onAbrir}>
            Abrir convite
          </Button>
        </>
      )}
      {c.situacao === 'aceito' && <span className="text-xs">Aceito: essa pessoa já entra pelo código.</span>}
      {c.situacao === 'expirado' && (
        <>
          <span className="text-destructive text-xs">Este convite venceu em {c.expiraEm}.</span>
          <Button size="sm" variant="outline" className="w-fit rounded-full" onClick={onPedirNovo}>
            Pedir um convite novo
          </Button>
        </>
      )}
    </div>
  )
}

/** Entrar com senha ou biometria, para quem escolheu (aparece depois de achar o contato). */
function EntradasRapidas({ pessoa, onSenha, onEntrar }: { pessoa: string; onSenha: () => void; onEntrar: (n: string) => void }) {
  const [acesso] = useAcesso(pessoa)
  const loja = useLoja()
  if (!acesso.senha && acesso.biometria !== 'ativa') return null
  return (
    <div className="flex flex-wrap gap-2">
      {acesso.senha && (
        <Button variant="outline" className="rounded-full" onClick={onSenha}>
          <KeyIcon /> Entrar com senha
        </Button>
      )}
      {acesso.biometria === 'ativa' && (
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            loja.registrar(`${pessoa} (cliente, app)`, 'Entrou no app com a biometria do aparelho')
            onEntrar(pessoa)
          }}
        >
          <FingerprintIcon /> Entrar com biometria
        </Button>
      )}
    </div>
  )
}

function PassoCodigo({ alvo, onVoltar, onOk, onBloqueado, primeiroAcesso, onEntrar }: { alvo: Alvo; onVoltar: () => void; onOk: () => void; onBloqueado: () => void; primeiroAcesso: boolean; onEntrar: (n: string) => void }) {
  const loja = useLoja()
  const [acesso] = useAcesso(alvo.nome)
  const [envio, setEnvio] = useState<{ codigo: string; expiraEm: number; fonte: string } | null>(null)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('')
  const [tentativas, setTentativas] = useState(5)
  const [errado, setErrado] = useState(false)
  const [agora, setAgora] = useState(() => Date.now())
  const enviar = useMemo(
    () => () => {
      setErroEnvio(null)
      setEnvio(null)
      enviarCodigo(alvo.canal, alvo.destino)
        .then((r) => setEnvio({ ...r.dados, fonte: r.fonte }))
        .catch((e: Error) => setErroEnvio(e.message))
    },
    [alvo.canal, alvo.destino],
  )
  useEffect(() => {
    enviar()
  }, [enviar])
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const resta = envio ? Math.max(0, Math.round((envio.expiraEm - agora) / 1000)) : 600
  const conferir = () => {
    if (!envio) return
    if (resta === 0) return
    if (codigo === '000000') {
      const n = tentativas - 1
      setTentativas(n)
      setErrado(true)
      setCodigo('')
      if (n === 0) onBloqueado()
      return
    }
    // Primeiro acesso (convite) ou quem ainda não aceitou o termo passa pelo termo; quem já usa entra.
    if (primeiroAcesso || !acesso.termo) return onOk()
    loja.registrar(`${alvo.nome} (cliente, app)`, `Entrou no app com código por ${alvo.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}`)
    onEntrar(alvo.nome)
  }
  return (
    <>
      <Voltar onClick={onVoltar} />
      <h1 className="text-2xl font-light tracking-tight">{primeiroAcesso ? 'Confirme que é você' : 'Código'}</h1>
      <p className="text-muted-foreground text-sm">
        Enviamos para {alvo.destino} ({alvo.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}). Vale por 10 minutos.
      </p>
      {erroEnvio && (
        <Faixa
          tom="erro"
          icone={<WarningCircleIcon weight="fill" />}
          acao={
            <Button size="sm" variant="outline" className="rounded-full" onClick={enviar}>
              Tentar de novo
            </Button>
          }
        >
          {erroEnvio}
        </Faixa>
      )}
      {!envio && !erroEnvio && <p className="text-muted-foreground text-sm">Enviando o código…</p>}
      {envio && (
        <div className="bg-sunken flex items-start gap-2 rounded-[16px] px-3 py-2.5 text-sm">
          {alvo.canal === 'whatsapp' ? <ChatCircleTextIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" /> : <EnvelopeSimpleIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />}
          <span className="min-w-0 flex-1">
            <span className="text-muted-foreground block text-[11px]">Mensagem recebida no {alvo.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'}</span>
            Seu código de acesso é <strong className="font-mono font-medium tracking-wider">{envio.codigo}</strong>. Não passe a ninguém.
          </span>
          <SeloDemonstracao fonte={envio.fonte} />
        </div>
      )}
      <input
        aria-label="Código"
        inputMode="numeric"
        autoComplete="one-time-code"
        value={codigo}
        onChange={(e) => {
          setErrado(false)
          setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))
        }}
        onKeyDown={(e) => e.key === 'Enter' && codigo.length === 6 && conferir()}
        placeholder="000000"
        className={cn(classeCampo, 'font-mono text-lg tracking-[0.4em]', errado && 'ring-destructive ring-2')}
      />
      {errado && tentativas > 0 && <p className="text-destructive text-xs">Código errado. Restam {tentativas} tentativas.</p>}
      <p className="text-muted-foreground text-xs tabular-nums">{resta > 0 ? `Vence em ${Math.floor(resta / 60)}:${String(resta % 60).padStart(2, '0')}` : 'O código venceu.'}</p>
      <Button className="rounded-full" disabled={codigo.length !== 6 || !envio || resta === 0} onClick={conferir}>
        {primeiroAcesso ? 'Confirmar' : 'Entrar'}
      </Button>
      <button type="button" className="text-muted-foreground w-fit cursor-pointer text-sm underline-offset-2 hover:underline" onClick={enviar}>
        Mandar outro código
      </button>
      <p className="text-muted-foreground text-[11px]">Na demonstração, o código acima entra, e qualquer outra sequência de 6 números também; 000000 simula um código errado (5 tentativas).</p>
    </>
  )
}

function PassoSenha({ alvo, onVoltar, onEntrar }: { alvo: Alvo; onVoltar: () => void; onEntrar: (n: string) => void }) {
  const loja = useLoja()
  const [senha, setSenha] = useState('')
  return (
    <>
      <Voltar onClick={onVoltar} />
      <h1 className="text-2xl font-light tracking-tight">Senha</h1>
      <Campo rotulo="Sua senha" tipo="password" valor={senha} onMudar={setSenha} ajuda="Esqueceu? Entre pelo código e troque em Empresa › Acessos." autoFocus />
      <Button
        className="rounded-full"
        disabled={senha.length < 6}
        onClick={() => {
          loja.registrar(`${alvo.nome} (cliente, app)`, 'Entrou no app com senha')
          onEntrar(alvo.nome)
        }}
      >
        Entrar
      </Button>
    </>
  )
}

function PassoTermo({ alvo, textos, onAceitar }: { alvo: Alvo; textos: ReturnType<typeof textosDoApp>; onAceitar: () => void; onEntrar: (n: string) => void }) {
  const [, setAcesso] = useAcesso(alvo.nome)
  const [li, setLi] = useState(false)
  return (
    <>
      <h1 className="text-2xl font-light tracking-tight">Termo de uso</h1>
      <p className="text-muted-foreground text-xs">
        {textos.produto} · versão {textos.termoVersao}
      </p>
      <div className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[18px] p-3.5 text-sm">
        {textos.termo.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input type="checkbox" checked={li} onChange={(e) => setLi(e.target.checked)} className="accent-primary mt-0.5 size-4" />
        Li e aceito o termo de uso e a política de privacidade.
      </label>
      <Button
        className="rounded-full"
        disabled={!li}
        onClick={() => {
          setAcesso((a) => ({ ...a, termo: { versao: textos.termoVersao, em: agoraTexto() } }))
          onAceitar()
        }}
      >
        Aceitar e continuar
      </Button>
      <p className="text-muted-foreground text-[11px]">O aceite fica em Empresa › Termos e recibos, com data, hora e versão.</p>
    </>
  )
}

function OpcaoForma({ ativo, onClick, icone, titulo, texto }: { ativo: boolean; onClick: () => void; icone: ReactNode; titulo: string; texto: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={ativo} className={cn('flex cursor-pointer items-start gap-3 rounded-[16px] px-3.5 py-3 text-left text-sm', ativo ? 'bg-raised shadow-contorno' : 'bg-sunken')}>
      <span className="text-muted-foreground mt-0.5 [&_svg]:size-5">{icone}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{titulo}</span>
        <span className="text-muted-foreground block text-xs">{texto}</span>
      </span>
    </button>
  )
}

function PassoForma({ alvo, onPronto }: { alvo: Alvo; onPronto: () => void }) {
  const [, setAcesso] = useAcesso(alvo.nome)
  const [senha, setSenha] = useState<'nao' | 'sim'>('nao')
  const [valor, setValor] = useState('')
  const [bio, setBio] = useState<boolean | null>(null)
  return (
    <>
      <h1 className="text-2xl font-light tracking-tight">Como prefere entrar?</h1>
      <OpcaoForma ativo={senha === 'nao'} onClick={() => setSenha('nao')} icone={<ChatCircleTextIcon />} titulo="Só com código (recomendado)" texto={`Um código novo por ${alvo.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'} quando trocar de aparelho. Nada para lembrar.`} />
      <OpcaoForma ativo={senha === 'sim'} onClick={() => setSenha('sim')} icone={<KeyIcon />} titulo="Código ou senha" texto="Crie uma senha, se preferir. Ela nunca é obrigatória." />
      {senha === 'sim' && <Campo rotulo="Crie uma senha (mínimo 8)" tipo="password" valor={valor} onMudar={setValor} erro={valor && valor.length < 8 ? 'Use pelo menos 8 caracteres.' : null} />}
      <div className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[18px] p-3.5 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <FingerprintIcon className="size-5" /> Usar a biometria deste aparelho?
        </p>
        <p className="text-muted-foreground text-xs">Fica uma chave de acesso só neste aparelho; você vê e apaga em Empresa › Acessos. Perguntamos uma vez só.</p>
        <div className="flex gap-2">
          <Button size="sm" variant={bio === true ? 'default' : 'outline'} className="rounded-full" onClick={() => setBio(true)}>
            Usar biometria
          </Button>
          <Button size="sm" variant={bio === false ? 'default' : 'ghost'} className="rounded-full" onClick={() => setBio(false)}>
            Agora não
          </Button>
        </div>
      </div>
      <Button
        className="rounded-full"
        disabled={bio === null || (senha === 'sim' && valor.length < 8)}
        onClick={() => {
          setAcesso((a) => ({ ...a, senha: senha === 'sim', biometria: bio ? 'ativa' : 'recusada' }))
          onPronto()
        }}
      >
        Continuar
      </Button>
    </>
  )
}

function PassoInstalar({ alvo, onPronto }: { alvo: Alvo; onPronto: (a: AcessoPessoa) => void }) {
  const [acesso, setAcesso] = useAcesso(alvo.nome)
  const [como, setComo] = useState<'android' | 'ios' | null>(null)
  const fim = (instalado: AcessoPessoa['instalado'], dispensado = false) => {
    const novo = { ...acesso, instalado, instalarDispensado: dispensado, ultimoAcesso: agoraTexto() }
    setAcesso(novo)
    onPronto(novo)
  }
  return (
    <>
      <h1 className="text-2xl font-light tracking-tight">Leve o app para a tela inicial</h1>
      <p className="text-muted-foreground text-sm">É um app web: não ocupa espaço nem pede loja. Instalado, ele recebe avisos no celular.</p>
      <div className="grid grid-cols-2 gap-2">
        <OpcaoForma ativo={como === 'android'} onClick={() => setComo('android')} icone={<AndroidLogoIcon />} titulo="Android" texto="Um toque" />
        <OpcaoForma ativo={como === 'ios'} onClick={() => setComo('ios')} icone={<AppleLogoIcon />} titulo="iPhone" texto="Três passos" />
      </div>
      {como === 'android' && (
        <div className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[18px] p-3.5 text-sm">
          <p>O Chrome mostra "Instalar app". Toque em Instalar e pronto.</p>
          <Button className="w-fit rounded-full" onClick={() => fim('android')}>
            Instalar
          </Button>
        </div>
      )}
      {como === 'ios' && (
        <ol className="bg-surface shadow-cartao flex flex-col gap-2 rounded-[18px] p-3.5 text-sm">
          <li className="flex items-center gap-2">
            <span className="bg-sunken flex size-6 items-center justify-center rounded-full text-xs">1</span> No Safari, toque em <ShareIcon className="size-4" /> Compartilhar.
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-sunken flex size-6 items-center justify-center rounded-full text-xs">2</span> Escolha "Adicionar à Tela de Início".
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-sunken flex size-6 items-center justify-center rounded-full text-xs">3</span> Toque em Adicionar e abra pelo ícone.
          </li>
          <Button className="mt-1 w-fit rounded-full" onClick={() => fim('ios')}>
            Já adicionei
          </Button>
        </ol>
      )}
      <Button variant="ghost" className="rounded-full" onClick={() => fim(null, true)}>
        Agora não
      </Button>
      <p className="text-muted-foreground text-[11px]">Sem instalar, os avisos chegam por WhatsApp ou e-mail, como hoje.</p>
    </>
  )
}

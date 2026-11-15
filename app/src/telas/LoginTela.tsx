import { ArrowLeftIcon, BuildingsIcon, EnvelopeOpenIcon, EyeIcon, EyeSlashIcon, LockKeyIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { salvarContas, usePersistente } from '@/ambiente/loja'
import { subinquilinos as subIniciais, type UsuarioCfg } from '@/dados/configuracoes'
import { useTabela } from '@/nucleo/react'
import { repos } from '@/nucleo/repositorios'
import { AceitarConvite } from './login/AceitarConvite'
import { Marca } from '@/components/compostos/marca'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Campo, CampoTexto } from '@/components/ui/formulario'
import { useEscritorio } from '@/nucleo/react'
import { cn } from '@/lib/utils'
import { papelExibido, permissoesDe, useSessao } from '@/ambiente/sessao'

/**
 * Entrada do painel da equipe (Fundações 2.1): e-mail e senha, segundo fator
 * para quem tem (obrigatório para administradores neste escritório), conta
 * desativada ou convite pendente barrados com o motivo. O tema carrega pelo
 * endereço, antes do login (Fundações 10).
 */
export function LoginTela({ onEntrar }: { onEntrar: (id: string) => void }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [passo, setPasso] = useState<'senha' | 'codigo' | 'esqueci' | 'enviado' | 'nova_senha' | 'contexto'>('senha')
  const [codigo, setCodigo] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const usuariosCfg = useSessao().contas
  const escritorio = { razaoSocial: useEscritorio()?.razao_social ?? '' }
  // O endereço do painel sai do domínio do escritório (marca branca, Fundações 10).
  const dominio = usuariosCfg[0]?.email.split('@')[1] ?? 'escritorio.com.br'
  const titulo = { senha: 'Entrar', codigo: 'Segundo fator', esqueci: 'Trocar a senha', enviado: 'Confira o e-mail', nova_senha: 'Nova senha', contexto: 'Onde você vai trabalhar' }
  // S09: convite aberto pelo link (#/...?convite=email) ou pela lista da demonstração; contexto quando a pessoa tem mais de um (modo BPO).
  const [convite, setConvite] = useState<UsuarioCfg | null>(() => {
    const m = window.location.hash.match(/[?&]convite=([^&]+)/)
    return m ? (usuariosCfg.find((u) => u.email === decodeURIComponent(m[1]) && u.situacao === 'convidado') ?? null) : null
  })
  const convites = useTabela('convite')
  const [subs] = usePersistente('cfg.esc.subs', subIniciais)
  const modoBpo = useEscritorio()?.modo_bpo ?? false
  const [codigoEmail, setCodigoEmail] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [senhaTrocada, setSenhaTrocada] = useState(false)
  /** Mais de um contexto: equipe do BPO com subinquilino (01, 2.5). */
  const contextos = (u: UsuarioCfg) => (u.vinculos.some((v) => v.setor === 'bpo_financeiro') && (modoBpo || subs.length > 0) ? [{ id: 'mae', nome: escritorio.razaoSocial, sub: 'escritório principal' }, ...subs.map((x) => ({ id: x.id, nome: x.nome, sub: `subinquilino · ${x.clientes} clientes` }))] : [])
  const concluirEntrada = (u: UsuarioCfg) => (contextos(u).length > 1 ? setPasso('contexto') : onEntrar(u.id))
  const conta = usuariosCfg.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())

  const entrar = () => {
    setErro(null)
    if (!conta) return setErro('E-mail ou senha não conferem.')
    if (conta.situacao === 'desativado') return setErro('Esta conta foi desativada pelo Administrador do escritório.')
    if (conta.situacao === 'convidado') return setErro('Convite ainda não aceito: abra o link que chegou no seu e-mail para criar a senha.')
    if (conta.situacao === 'bloqueado') return setErro('Acesso bloqueado temporariamente. Fale com o Administrador.')
    if (senha.length < 4) return setErro('E-mail ou senha não conferem.')
    if (conta.segundoFator) return setPasso('codigo')
    concluirEntrada(conta)
  }

  const preencher = (id: string) => {
    const u = usuariosCfg.find((x) => x.id === id)!
    setEmail(u.email)
    setSenha('demonstracao')
    setErro(null)
    setPasso('senha')
  }

  return (
    <div className="from-background to-background-end text-foreground flex min-h-dvh flex-col bg-gradient-to-b">
      {/* Marca no mesmo lugar e no mesmo desenho da barra lateral do sistema. */}
      <header className="flex h-12 shrink-0 items-center gap-2.5 px-[16px] pt-4 sm:mt-4">
        <Marca />
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:py-14">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-muted-foreground text-3xl font-light tracking-tight sm:text-4xl">{convite ? 'Primeiro acesso' : titulo[passo]}</h1>
            <p className="text-muted-foreground text-sm">{escritorio.razaoSocial}</p>
          </div>
          {convite && (
            <AceitarConvite
              conta={convite}
              convite={convites.find((c) => c.destino === convite.email && !c.aceito_em)}
              escritorio={escritorio.razaoSocial}
              onVoltar={() => setConvite(null)}
              onAceito={(u) => {
                salvarContas(usuariosCfg.map((x) => (x.id === u.id ? u : x)))
                const cv = convites.find((c) => c.destino === u.email && !c.aceito_em)
                if (cv) repos.convites.atualizar(cv.id, { aceito_em: new Date().toISOString() }, { texto: `${u.nome} aceitou o convite` })
                setConvite(null)
                onEntrar(u.id)
              }}
            />
          )}
          {!convite && passo === 'senha' && (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                entrar()
              }}
            >
              {senhaTrocada && <p className="bg-success/15 rounded-md px-3 py-2 text-sm">Senha trocada. Entre com a senha nova.</p>}
              <Campo rotulo="E-mail">{(id) => <CampoTexto id={id} tipo="email" valor={email} onMudar={setEmail} placeholder={`voce@${dominio}`} />}</Campo>
              <Campo rotulo="Senha" erro={erro ?? undefined}>
                {(id) => (
                  <span className="relative">
                    <CampoTexto id={id} tipo={ver ? 'text' : 'password'} valor={senha} onMudar={setSenha} className="pr-10" />
                    <button type="button" aria-label={ver ? 'Esconder senha' : 'Mostrar senha'} onClick={() => setVer(!ver)} className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer">
                      {ver ? <EyeSlashIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                  </span>
                )}
              </Campo>
              <Button type="submit" className="rounded-full" disabled={!email || !senha}>
                Entrar
              </Button>
              <button type="button" className="text-muted-foreground cursor-pointer self-center text-sm underline-offset-2 hover:underline" onClick={() => setPasso('esqueci')}>
                Esqueci a senha
              </button>
            </form>
          )}

          {!convite && passo === 'codigo' && conta && (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (/^\d{6}$/.test(codigo)) concluirEntrada(conta)
                else setErro('Digite os 6 números do app autenticador.')
              }}
            >
              <p className="text-muted-foreground text-sm">{conta.papel === 'administrador' ? 'Obrigatório para administradores neste escritório.' : 'Você ligou o segundo fator na sua conta.'} Digite o código do app autenticador.</p>
              <Campo rotulo="Código" erro={erro ?? undefined} ajuda="Na demonstração, qualquer sequência de 6 números entra.">
                {(id) => <CampoTexto id={id} valor={codigo} onMudar={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))} mono placeholder="000000" />}
              </Campo>
              <Button type="submit" className="rounded-full">
                Confirmar
              </Button>
              <button type="button" className="text-muted-foreground flex cursor-pointer items-center gap-1 self-center text-sm" onClick={() => setPasso('senha')}>
                <ArrowLeftIcon className="size-3.5" /> Voltar
              </button>
            </form>
          )}

          {!convite && passo === 'esqueci' && (
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                setPasso('enviado')
              }}
            >
              <p className="text-muted-foreground text-sm">Mandamos um código para o seu e-mail. Ele vale por 30 minutos.</p>
              <Campo rotulo="E-mail">{(id) => <CampoTexto id={id} tipo="email" valor={email} onMudar={setEmail} />}</Campo>
              <Button type="submit" className="rounded-full" disabled={!email}>
                Enviar código
              </Button>
              <button type="button" className="text-muted-foreground flex cursor-pointer items-center gap-1 self-center text-sm" onClick={() => setPasso('senha')}>
                <ArrowLeftIcon className="size-3.5" /> Voltar
              </button>
            </form>
          )}

          {!convite && passo === 'enviado' && (
            <form
              className="flex flex-col gap-4 text-sm"
              onSubmit={(e) => {
                e.preventDefault()
                if (/^\d{6}$/.test(codigoEmail)) {
                  setErro(null)
                  setPasso('nova_senha')
                } else setErro('Digite os 6 números que chegaram no e-mail.')
              }}
            >
              <p className="text-muted-foreground">Se {email} tiver conta aqui, chega um código de 6 números em instantes (vale 30 minutos). Por segurança, não dizemos se o e-mail existe.</p>
              <Campo rotulo="Código do e-mail" erro={erro ?? undefined} ajuda="Na demonstração, qualquer sequência de 6 números segue.">
                {(id) => <CampoTexto id={id} valor={codigoEmail} onMudar={(v) => setCodigoEmail(v.replace(/\D/g, '').slice(0, 6))} mono placeholder="000000" />}
              </Campo>
              <Button type="submit" className="rounded-full">
                Continuar
              </Button>
              <button type="button" className="text-muted-foreground flex cursor-pointer items-center gap-1 self-center" onClick={() => setPasso('senha')}>
                <ArrowLeftIcon className="size-3.5" /> Voltar para entrar
              </button>
            </form>
          )}

          {!convite && passo === 'nova_senha' && (
            <form
              className="flex flex-col gap-4 text-sm"
              onSubmit={(e) => {
                e.preventDefault()
                if (novaSenha.length < 8 || !/\d/.test(novaSenha)) return setErro('Pelo menos 8 caracteres, com um número.')
                setErro(null)
                setSenhaTrocada(true)
                setSenha('')
                setNovaSenha('')
                setCodigoEmail('')
                setPasso('senha')
              }}
            >
              <p className="text-muted-foreground">Escolha a senha nova. As outras sessões abertas desta conta caem.</p>
              <Campo rotulo="Senha nova" erro={erro ?? undefined} ajuda="Pelo menos 8 caracteres, com um número.">
                {(id) => <CampoTexto id={id} tipo="password" valor={novaSenha} onMudar={setNovaSenha} />}
              </Campo>
              <Button type="submit" className="rounded-full">
                Salvar senha
              </Button>
            </form>
          )}

          {!convite && passo === 'contexto' && conta && (
            <div className="flex flex-col gap-3">
              <p className="text-muted-foreground text-sm">Sua conta trabalha em mais de um lugar. Dá para trocar depois pelo seletor de cliente.</p>
              {contextos(conta).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    try {
                      window.sessionStorage.setItem('s09:contexto', c.id)
                    } catch {
                      /* sem armazenamento */
                    }
                    onEntrar(conta.id)
                  }}
                  className="bg-surface hover:bg-raised shadow-contorno flex cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left"
                >
                  <BuildingsIcon className="text-muted-foreground size-6 shrink-0" weight="duotone" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{c.nome}</span>
                    <span className="text-muted-foreground block text-xs">{c.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <section className="mt-12 flex w-full max-w-3xl flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-muted-foreground text-xs">Contas desta demonstração</h2>
            <span className="text-muted-foreground text-xs">toque para preencher</span>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {/* Administradora na linha inteira; as que não entram fecham a grade em par. */}
            {[...usuariosCfg.filter((u) => u.situacao === 'ativo'), ...usuariosCfg.filter((u) => u.situacao !== 'ativo')].map((u, i) => {
              const p = u.situacao === 'ativo' ? permissoesDe(u) : null
              return (
                <li key={u.id} className={cn(i === 0 && usuariosCfg.length % 2 === 1 && 'sm:col-span-2')}>
                  <button
                    type="button"
                    onClick={() => (u.situacao === 'convidado' ? setConvite(u) : preencher(u.id))}
                    aria-pressed={conta?.id === u.id}
                    className={cn(
                      'bg-surface hover:bg-raised shadow-contorno flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                      conta?.id === u.id && 'bg-raised ring-foreground/25 ring-1',
                      u.situacao === 'desativado' && 'opacity-70',
                    )}
                  >
                    <Avatar nome={u.nome} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">{u.nome}</span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {u.situacao === 'ativo' ? `${papelExibido(u)} · ${p!.resumo}` : u.situacao === 'convidado' ? 'convite pendente: toque para abrir o link do convite' : 'conta desativada (não entra)'}
                      </span>
                    </span>
                    {u.situacao === 'convidado' && <EnvelopeOpenIcon className="text-muted-foreground size-4 shrink-0" aria-label="convite" />}
                    {u.segundoFator && <ShieldCheckIcon className="text-muted-foreground size-4 shrink-0" aria-label="segundo fator" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </main>

      <footer className="text-muted-foreground flex items-center justify-center gap-1.5 px-4 pb-4 text-center text-xs">
        <LockKeyIcon className="size-3.5 shrink-0" /> painel.{dominio} · conexão protegida
      </footer>
    </div>
  )
}

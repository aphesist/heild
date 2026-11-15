import { ArrowLeftIcon, CheckIcon, QrCodeIcon, WarningIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Campo, CampoTexto, Interruptor, Passos } from '@/components/ui/formulario'
import type { UsuarioCfg } from '@/dados/configuracoes'
import type { Convite } from '@/nucleo/modelo/entidades'
import { rotuloSetorCurto } from '@/nucleo/permissoes'

const rotuloPapel = { administrador: 'Administrador', gestor: 'Gestor', colaborador: 'Membro' }

/** Termo de uso da equipe (01, 2.4; 11, 5): o que a pessoa aceita antes de entrar. */
export const termoEquipe = [
  'As mensagens internas não se apagam: editar guarda a versão anterior, com autor e data (11, 1).',
  'O tempo de trabalho é registrado por cliente para saber o custo de cada um; você vê os seus dados primeiro e confirma o que o sistema deduziu (05).',
  'Os integrantes de IA agem em seu nome dentro do que a sua conta pode; o que sai ao cliente, paga, transmite ou assina passa por aprovação.',
  'Documentos e dados dos clientes ficam no escritório: nada de baixar para uso pessoal (LGPD).',
]

/**
 * Primeiro acesso por convite (S09-A90; 01, 2.4): link de 7 dias, confirmar a
 * identidade, definir a senha, ligar o segundo fator (obrigatório para
 * Administrador) e aceitar o termo de uso da equipe.
 */
export function AceitarConvite({ conta, convite, escritorio, onVoltar, onAceito }: { conta: UsuarioCfg; convite?: Convite; escritorio: string; onVoltar: () => void; onAceito: (u: UsuarioCfg) => void }) {
  const [passo, setPasso] = useState(0)
  const [nome, setNome] = useState(conta.nome)
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [fator, setFator] = useState(conta.papel === 'administrador')
  const [codigo, setCodigo] = useState('')
  const [termo, setTermo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const expirado = convite ? new Date(convite.expira_em).getTime() < Date.now() : false
  const passos = ['Você', 'Senha', 'Segundo fator', 'Termo']

  if (expirado)
    return (
      <div className="flex flex-col gap-4 text-sm">
        <p className="bg-warning/15 flex items-start gap-2 rounded-md px-3 py-2.5">
          <WarningIcon className="text-warning mt-0.5 size-4 shrink-0" /> Este convite venceu em {new Date(convite!.expira_em).toLocaleDateString('pt-BR')}. Peça ao Administrador do escritório para reenviar: o novo vale mais 7 dias.
        </p>
        <Button variant="ghost" className="rounded-full" onClick={onVoltar}>
          <ArrowLeftIcon /> Voltar
        </Button>
      </div>
    )

  const avancar = () => {
    setErro(null)
    if (passo === 0 && !nome.trim()) return setErro('Diga o seu nome.')
    if (passo === 1) {
      if (senha.length < 8 || !/\d/.test(senha)) return setErro('Pelo menos 8 caracteres, com um número.')
      if (senha !== senha2) return setErro('As duas senhas não batem.')
    }
    if (passo === 2 && fator && !/^\d{6}$/.test(codigo)) return setErro('Digite os 6 números do app autenticador.')
    if (passo === 3) {
      if (!termo) return setErro('Para entrar, aceite o termo da equipe.')
      return onAceito({ ...conta, nome: nome.trim(), situacao: 'ativo', segundoFator: fator, ultimoAcesso: 'agora (primeiro acesso)' })
    }
    setPasso((p) => p + 1)
  }

  return (
    <form
      className="flex flex-col gap-4 text-sm"
      onSubmit={(e) => {
        e.preventDefault()
        avancar()
      }}
    >
      <p className="text-muted-foreground">
        Convite de {escritorio} para {conta.email}: {rotuloPapel[conta.papel]}
        {conta.vinculos.length ? ` em ${conta.vinculos.map((v) => `${rotuloSetorCurto[v.setor]}${v.modo === 'gestao' ? ' (gestão)' : ''}`).join(', ')}` : ''}.{convite ? ` Vale até ${new Date(convite.expira_em).toLocaleDateString('pt-BR')}.` : ''}
      </p>
      <Passos passos={passos} atual={passo} />
      {passo === 0 && (
        <>
          <Campo rotulo="Seu nome" erro={erro ?? undefined}>
            {(id) => <CampoTexto id={id} valor={nome} onMudar={setNome} />}
          </Campo>
          <Campo rotulo="E-mail">{(id) => <CampoTexto id={id} valor={conta.email} onMudar={() => {}} />}</Campo>
        </>
      )}
      {passo === 1 && (
        <>
          <Campo rotulo="Senha" ajuda="Pelo menos 8 caracteres, com um número.">
            {(id) => <CampoTexto id={id} tipo="password" valor={senha} onMudar={setSenha} />}
          </Campo>
          <Campo rotulo="Repita a senha" erro={erro ?? undefined}>
            {(id) => <CampoTexto id={id} tipo="password" valor={senha2} onMudar={setSenha2} />}
          </Campo>
        </>
      )}
      {passo === 2 && (
        <>
          <Interruptor ligado={fator} onMudar={(v) => conta.papel !== 'administrador' && setFator(v)} desabilitado={conta.papel === 'administrador'} rotulo="Segundo fator" detalhe={conta.papel === 'administrador' ? 'Obrigatório para Administrador.' : 'Recomendado. Dá para ligar depois em Minha conta.'} />
          {fator && (
            <>
              <div className="bg-sunken flex items-center gap-3 rounded-md p-3">
                <QrCodeIcon className="size-16 shrink-0" weight="duotone" aria-label="QR code do app autenticador (simulado)" />
                <span className="text-muted-foreground text-xs">Leia o código com o app autenticador (Google Authenticator, Authy, 1Password) e digite os 6 números que aparecerem.</span>
              </div>
              <Campo rotulo="Código do app" erro={erro ?? undefined} ajuda="Na demonstração, qualquer sequência de 6 números segue.">
                {(id) => <CampoTexto id={id} valor={codigo} onMudar={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))} mono placeholder="000000" />}
              </Campo>
            </>
          )}
        </>
      )}
      {passo === 3 && (
        <>
          <ul className="bg-sunken/60 flex flex-col gap-2 rounded-md p-3">
            {termoEquipe.map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 size-3.5 shrink-0" /> {t}
              </li>
            ))}
          </ul>
          <Interruptor ligado={termo} onMudar={setTermo} rotulo="Li e aceito o termo de uso da equipe" />
          {erro && <p className="text-destructive-text text-sm">{erro}</p>}
        </>
      )}
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" className="rounded-full" onClick={() => (passo === 0 ? onVoltar() : setPasso((p) => p - 1))}>
          <ArrowLeftIcon /> Voltar
        </Button>
        <Button type="submit" className="ml-auto rounded-full">
          {passo === 3 ? 'Aceitar e entrar' : 'Continuar'}
        </Button>
      </div>
    </form>
  )
}

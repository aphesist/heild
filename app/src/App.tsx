import { useMemo, useState } from 'react'
import { LojaProvider } from '@/ambiente/loja'
import { PainelLab, type Visao } from '@/ambiente/PainelLab'
import { SessaoProvider, useSessaoBruta } from '@/ambiente/sessao'
import { LoginTela } from '@/telas/LoginTela'
import { Plataforma } from '@/telas/Plataforma'
import { MolduraCliente } from '@/cliente/MolduraCliente'
import { BancoProvider, useBanco } from '@/nucleo/react'
import type { Contexto } from '@/nucleo/permissoes'
import { ThemeProvider } from '@/theme/ThemeProvider'
import { temas } from '@/theme/temas'
import type { ModoCor } from '@/theme/tipos'
import { usePreferencia } from '@/hooks/usePreferencia'
import { ConfirmarProvider } from '@/components/kit/confirmar'
import { irParaPagina, paginaDoHash, useHash } from '@/nucleo/rotas'
import { VitrineKit } from '@/telas/VitrineKit'
import { FaixaVerComo } from '@/ambiente/ver-como'

/**
 * `npm run app` e a página publicada: o escritório de demonstração inteiro.
 * Começa no login; cada conta vê o sistema com as próprias permissões. Os
 * dados ficam no banco do navegador (src/nucleo): recarregar não perde nada.
 */
export default function App() {
  const [modo, setModo] = useState<ModoCor>(() => (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'))
  return (
    <BancoProvider>
      <Escritorios modo={modo} setModo={setModo} />
    </BancoProvider>
  )
}

function Escritorios({ modo, setModo }: { modo: ModoCor; setModo: (m: ModoCor | ((x: ModoCor) => ModoCor)) => void }) {
  const { escritorio, restaurar } = useBanco()
  // Cada escritório de exemplo tem o próprio tema (marca branca); o painel da demonstração troca.
  const [temaEscolhido, setTemaId] = usePreferencia<string | null>(`ui-lab:tema:${escritorio.id}`, null)
  const temaId = temaEscolhido ?? (escritorio.id === 'esc-horizonte' ? 'horizonte' : temas[0].id)
  // A página sai do endereço: #/app é o app do cliente, #/kit a vitrine do kit, o resto é o sistema.
  const pagina = paginaDoHash(useHash())
  const visao: Visao = pagina === 'app' ? 'cliente' : 'escritorio'
  const setVisao = (v: Visao) => irParaPagina(v === 'cliente' ? 'app' : 'sistema')
  const [pessoaApp, setPessoaApp] = useState<string | null>(null)
  const [geracao, setGeracao] = useState(0)
  /** Volta o ambiente inteiro à configuração original: dados, conta, app, tema e preferências guardadas. */
  const reiniciarTudo = async () => {
    try {
      Object.keys(window.localStorage)
        .filter((k) => k.startsWith('ui-lab:'))
        .forEach((k) => window.localStorage.removeItem(k))
      window.sessionStorage.removeItem('heild:sessao')
    } catch {
      /* sem armazenamento */
    }
    await restaurar()
    setVisao('escritorio')
    setPessoaApp(null)
    setTemaId(null)
    setGeracao((g) => g + 1)
  }
  const tema = temas.find((t) => t.id === temaId) ?? temas[0]
  // No app do cliente, quem age é a pessoa do cliente (as ferramentas expostas ao cliente).
  const contextoApp = useMemo<Contexto | null>(() => (visao === 'cliente' ? { ator: { tipo: 'pessoa_cliente', nome: pessoaApp ?? 'Cliente' }, origem: 'tela' } : null), [visao, pessoaApp])

  return (
    <ThemeProvider tema={tema} modo={modo}>
      <SessaoProvider key={`${escritorio.id}-${geracao}`} contextoExterno={contextoApp}>
        <LojaProvider>
          <ConfirmarProvider>
            {pagina === 'kit' ? <VitrineKit /> : visao === 'escritorio' ? <Escritorio onAlternarModo={() => setModo((m) => (m === 'claro' ? 'escuro' : 'claro'))} /> : <MolduraCliente pessoa={pessoaApp} onPessoa={setPessoaApp} onEscritorio={() => setVisao('escritorio')} />}
            <FaixaVerComo />
            <PainelLab temaId={temaId} onTema={setTemaId} modo={modo} onModo={setModo} visao={visao} onVisao={setVisao} pessoaApp={pessoaApp} onPessoaApp={setPessoaApp} onReiniciar={reiniciarTudo} />
          </ConfirmarProvider>
        </LojaProvider>
      </SessaoProvider>
    </ThemeProvider>
  )
}

function Escritorio({ onAlternarModo }: { onAlternarModo: () => void }) {
  const sessao = useSessaoBruta()!
  if (!sessao.usuario) return <LoginTela onEntrar={sessao.entrar} />
  return <Plataforma key={sessao.usuario.id} clienteInicial={null} onAlternarModo={onAlternarModo} />
}
